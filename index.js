import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const startedAt = Date.now();
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(`[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`);
  });
  next();
});

if (!process.env.DATABASE_URL) {
  console.error('[CONFIG] DATABASE_URL tidak ditemukan. Set environment variable di Vercel atau file .env lokal.');
} else {
  console.log('[CONFIG] DATABASE_URL terbaca.');
}

const sql = neon(process.env.DATABASE_URL || 'postgresql://<user>:<password>@<ep-hostname>.neon.tech/<dbname>?sslmode=require');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'; // Ganti dengan secret key yang kuat di .env
const SALT_ROUNDS = 10;

const ROLE_TO_DB = {
  Admin: 'admin',
  Pemimpin: 'pemimpin',
  Dispatcher: 'dispatcher',
};

const ROLE_FROM_DB = {
  admin: 'Admin',
  pemimpin: 'Pemimpin',
  dispatcher: 'Dispatcher',
};

const toDbRole = (role) => ROLE_TO_DB[role] || String(role).toLowerCase();
const fromDbRole = (role) => ROLE_FROM_DB[String(role).toLowerCase()] || role;

const mapUserRow = (user) => ({
  id: user.id,
  name: user.nama,
  email: user.email,
  role: fromDbRole(user.role),
});

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const safeNum = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const monthKey = (dateValue) => {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${date.getMonth()}`;
};

const buildMonthlySeries = (penjualanRows, pengirimanRows, monthsBack) => {
  const now = new Date();
  const series = {};

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const pointDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(pointDate);
    series[key] = {
      month: MONTHS_SHORT[pointDate.getMonth()],
      penjualan: 0,
      distribusi: 0,
    };
  }

  penjualanRows.forEach((row) => {
    const key = monthKey(row.date);
    if (series[key]) {
      series[key].penjualan += safeNum(row.amount);
    }
  });

  pengirimanRows.forEach((row) => {
    const key = monthKey(row.tanggal);
    if (series[key]) {
      series[key].distribusi += safeNum(row.volume_liter || 1);
    }
  });

  Object.values(series).forEach((point) => {
    if (point.distribusi === 0 && point.penjualan > 0) {
      point.distribusi = Math.round(point.penjualan * 0.92);
    }
  });

  return Object.values(series);
};

const parseDateFilter = (query) => {
  const startDate = query.startDate || null;
  const endDate = query.endDate || null;
  return { startDate, endDate, hasFilter: Boolean(startDate && endDate) };
};

// Middleware untuk otentikasi token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
    req.user = user;
    next();
  });
};


const handleRequest = async (res, operation) => {
  try {
    const data = await operation();
    res.json(data);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// --- ARMADA ---
app.get('/api/armada', authenticateToken, (req, res) => handleRequest(res, async () => {
  const { startDate, endDate, hasFilter } = parseDateFilter(req.query);
  if (hasFilter) {
    return sql`
      SELECT * FROM armada
      WHERE created_at::date >= ${startDate}::date AND created_at::date <= ${endDate}::date
      ORDER BY created_at DESC
    `;
  }
  return sql`SELECT * FROM armada ORDER BY created_at DESC`;
}));

app.get('/api/armada/:id', authenticateToken, (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT * FROM armada WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/armada', authenticateToken, (req, res) => handleRequest(res, () => {
  const { id, plateNumber, type, driver, status, lastService, nextService, totalTrips, mileage } = req.body;
  if (!id || !plateNumber || !type) throw new Error("Missing required fields");
  return sql`
    INSERT INTO armada (id, "plateNumber", type, driver, status, "lastService", "nextService", "totalTrips", mileage) 
    VALUES (${id}, ${plateNumber}, ${type}, ${driver}, ${status}, ${lastService}, ${nextService}, ${totalTrips}, ${mileage})
    RETURNING *
  `;
}));

app.put('/api/armada/:id', authenticateToken, (req, res) => handleRequest(res, () => {
  const { plateNumber, type, driver, status, lastService, nextService, totalTrips, mileage } = req.body;
  if (!plateNumber || !type) throw new Error("Missing required fields");
  return sql`
    UPDATE armada SET 
      "plateNumber" = ${plateNumber}, type = ${type}, driver = ${driver}, status = ${status}, 
      "lastService" = ${lastService}, "nextService" = ${nextService}, "totalTrips" = ${totalTrips}, mileage = ${mileage}
    WHERE id = ${req.params.id}
    RETURNING *
  `;
}));

app.delete('/api/armada/:id', authenticateToken, (req, res) => handleRequest(res, () => sql`DELETE FROM armada WHERE id = ${req.params.id} RETURNING *`));

// --- DRIVER ---
app.get('/api/driver', authenticateToken, (req, res) => handleRequest(res, async () => {
  const { startDate, endDate, hasFilter } = parseDateFilter(req.query);
  if (hasFilter) {
    return sql`
      SELECT * FROM driver
      WHERE created_at::date >= ${startDate}::date AND created_at::date <= ${endDate}::date
      ORDER BY created_at DESC
    `;
  }
  return sql`SELECT * FROM driver ORDER BY created_at DESC`;
}));

app.get('/api/driver/:id', authenticateToken, (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT * FROM driver WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/driver', authenticateToken, (req, res) => handleRequest(res, () => {
  const { id, name, phone, vehicle, status, rating, totalTrips, completedTrips, revenue, joinDate } = req.body;
  if (!id || !name || !phone) throw new Error("Missing required fields");
  return sql`
    INSERT INTO driver (id, name, phone, vehicle, status, rating, "totalTrips", "completedTrips", revenue, "joinDate") 
    VALUES (${id}, ${name}, ${phone}, ${vehicle}, ${status}, ${rating}, ${totalTrips}, ${completedTrips}, ${revenue}, ${joinDate})
    RETURNING *
  `;
}));

app.put('/api/driver/:id', authenticateToken, (req, res) => handleRequest(res, () => {
  const { name, phone, vehicle, status, rating, totalTrips, completedTrips, revenue, joinDate } = req.body;
  if (!name || !phone) throw new Error("Missing required fields");
  return sql`
    UPDATE driver SET 
      name = ${name}, phone = ${phone}, vehicle = ${vehicle}, status = ${status}, 
      rating = ${rating}, "totalTrips" = ${totalTrips}, "completedTrips" = ${completedTrips}, revenue = ${revenue}, "joinDate" = ${joinDate}
    WHERE id = ${req.params.id}
    RETURNING *
  `;
}));

app.delete('/api/driver/:id', authenticateToken, (req, res) => handleRequest(res, () => sql`DELETE FROM driver WHERE id = ${req.params.id} RETURNING *`));

// --- PENGIRIMAN ---
app.get('/api/pengiriman', authenticateToken, (req, res) => handleRequest(res, async () => {
  const { startDate, endDate, hasFilter } = parseDateFilter(req.query);
  if (hasFilter) {
    return sql`
      SELECT * FROM pengiriman
      WHERE tanggal >= ${startDate}::date AND tanggal <= ${endDate}::date
      ORDER BY tanggal DESC
    `;
  }
  return sql`SELECT * FROM pengiriman ORDER BY tanggal DESC`;
}));

app.get('/api/pengiriman/:id', authenticateToken, (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT * FROM pengiriman WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/pengiriman', authenticateToken, (req, res) => handleRequest(res, () => {
  const { id, tanggal, tujuan, status } = req.body;
  if (!id || !tanggal || !tujuan) throw new Error("Missing required fields");
  return sql`
    INSERT INTO pengiriman (id, tanggal, tujuan, status) 
    VALUES (${id}, ${tanggal}, ${tujuan}, ${status})
    RETURNING *
  `;
}));

app.put('/api/pengiriman/:id', authenticateToken, (req, res) => handleRequest(res, () => {
  const { tanggal, tujuan, status } = req.body;
  if (!tanggal || !tujuan) throw new Error("Missing required fields");
  return sql`
    UPDATE pengiriman SET tanggal = ${tanggal}, tujuan = ${tujuan}, status = ${status}
    WHERE id = ${req.params.id}
    RETURNING *
  `;
}));

app.delete('/api/pengiriman/:id', authenticateToken, (req, res) => handleRequest(res, () => sql`DELETE FROM pengiriman WHERE id = ${req.params.id} RETURNING *`));

// --- PENJUALAN ---
app.get('/api/penjualan', authenticateToken, (req, res) => handleRequest(res, async () => {
  const { startDate, endDate, hasFilter } = parseDateFilter(req.query);
  if (hasFilter) {
    return sql`
      SELECT * FROM penjualan
      WHERE date >= ${startDate}::date AND date <= ${endDate}::date
      ORDER BY date DESC
    `;
  }
  return sql`SELECT * FROM penjualan ORDER BY date DESC`;
}));

app.get('/api/penjualan/:id', authenticateToken, (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT * FROM penjualan WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/penjualan', authenticateToken, (req, res) => handleRequest(res, () => {
  const { id, customer, amount, date, region } = req.body;
  if (!id || !customer || !amount) throw new Error("Missing required fields");
  return sql`
    INSERT INTO penjualan (id, customer, amount, date, region) 
    VALUES (${id}, ${customer}, ${amount}, ${date}, ${region})
    RETURNING *
  `;
}));

app.put('/api/penjualan/:id', authenticateToken, (req, res) => handleRequest(res, () => {
  const { customer, amount, date, region } = req.body;
  if (!customer || !amount) throw new Error("Missing required fields");
  return sql`
    UPDATE penjualan SET customer = ${customer}, amount = ${amount}, date = ${date}, region = ${region}
    WHERE id = ${req.params.id}
    RETURNING *
  `;
}));

app.delete('/api/penjualan/:id', authenticateToken, (req, res) => handleRequest(res, () => sql`DELETE FROM penjualan WHERE id = ${req.params.id} RETURNING *`));

// --- USERS ---
app.get('/api/users', authenticateToken, (req, res) => handleRequest(res, async () => {
  const rows = await sql`SELECT id, nama, email, role FROM users ORDER BY created_at DESC`;
  return rows.map(mapUserRow);
}));

app.get('/api/users/:id', authenticateToken, (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT id, nama, email, role FROM users WHERE id = ${req.params.id}`;
  return mapUserRow(result[0]);
}));

app.post('/api/users', authenticateToken, async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new Error("Missing required fields");

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await sql`
      INSERT INTO users (nama, email, password_hash, role) 
      VALUES (${name}, ${email.toLowerCase()}, ${hashedPassword}, ${toDbRole(role)})
      RETURNING id, nama, email, role
    `;
    res.status(201).json(mapUserRow(result[0]));
  } catch (error) {
    console.error('[DB] Create user error:', error);
    res.status(500).json({ message: 'Gagal membuat pengguna baru.' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email) throw new Error("Missing required fields");

  try {
    let result;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      result = await sql`
        UPDATE users SET nama = ${name}, email = ${email.toLowerCase()}, password_hash = ${hashedPassword}, role = ${toDbRole(role)}
        WHERE id = ${req.params.id} RETURNING id, nama, email, role`;
    } else {
      result = await sql`
        UPDATE users SET nama = ${name}, email = ${email.toLowerCase()}, role = ${toDbRole(role)}
        WHERE id = ${req.params.id} RETURNING id, nama, email, role`;
    }
    res.json(mapUserRow(result[0]));
  } catch (error) {
    console.error('[DB] Update user error:', error);
    res.status(500).json({ message: 'Gagal memperbarui pengguna.' });
  }
});

app.delete('/api/users/:id', authenticateToken, (req, res) => handleRequest(res, async () => {
  const result = await sql`DELETE FROM users WHERE id = ${req.params.id} RETURNING id, nama, email, role`;
  return mapUserRow(result[0]);
}));

// --- HEALTH CHECK ---

app.get('/api/health', async (_req, res) => {
  try {
    console.log('[DB] Health check query...');
    await sql`SELECT 1 AS ok`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('[DB] Health check gagal:', error);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: error instanceof Error ? error.message : 'Database tidak dapat dihubungi',
    });
  }
});

// --- AUTHENTICATION ---

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const userRole = role || 'Dispatcher';
  const allowedRoles = ['Admin', 'Pemimpin', 'Dispatcher'];

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
  }

  if (!allowedRoles.includes(userRole)) {
    return res.status(400).json({ message: 'Role tidak valid.' });
  }

  try {
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await sql`
      INSERT INTO users (nama, email, password_hash, role) 
      VALUES (${name}, ${email.toLowerCase()}, ${hashedPassword}, ${toDbRole(userRole)})
      RETURNING id, nama, email, role
    `;

    res.status(201).json(mapUserRow(newUser[0]));
  } catch (error) {
    console.error('[AUTH] Register error:', error);
    // Kirim pesan error yang lebih spesifik ke frontend
    let errorMessage = 'Terjadi kesalahan pada server saat registrasi.';
    if (error instanceof Error) {
      errorMessage = error.message.includes('users_email_key') ? 'Email sudah terdaftar.' : `Database Error: ${error.message}`;
    }
    res.status(500).json({ message: errorMessage });
  }
};

const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, dan role wajib diisi.' });
  }

  try {
    const dbRole = toDbRole(role);
    console.log(`[AUTH] Login attempt: ${email.toLowerCase()} (${dbRole})`);
    const users = await sql`
      SELECT * FROM users
      WHERE LOWER(email) = ${email.toLowerCase()} AND LOWER(role) = ${dbRole}
    `;
    if (users.length === 0) {
      console.log('[AUTH] Login gagal: user tidak ditemukan');
      return res.status(401).json({ message: 'Email, password, atau role salah.' });
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('[AUTH] Login gagal: password salah');
      return res.status(401).json({ message: 'Email, password, atau role salah.' });
    }
    const displayRole = fromDbRole(user.role);
    const token = jwt.sign({ id: user.id, role: displayRole }, JWT_SECRET, { expiresIn: '1d' });
    console.log(`[AUTH] Login berhasil: ${user.email} (${displayRole})`);
    res.json({ token, name: user.nama, role: displayRole });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.' });
  }
};

app.post('/api/auth/register', registerUser);
app.post('/api/register', registerUser);
app.post('/api/auth/login', loginUser);
app.post('/api/login', loginUser);

// --- ANALYTICS FROM NEON ---

app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const penjualanRows = await sql`SELECT * FROM penjualan ORDER BY date DESC`;
    const pengirimanRows = await sql`SELECT * FROM pengiriman ORDER BY tanggal DESC`;

    const now = new Date();
    const thisMonthSales = penjualanRows.filter((row) => {
      const date = new Date(row.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const totalPenjualan = thisMonthSales.reduce((sum, row) => sum + safeNum(row.amount), 0);
    const jumlahTransaksi = thisMonthSales.length;
    const rataRataNilai = jumlahTransaksi > 0 ? Math.round(totalPenjualan / jumlahTransaksi) : 0;
    const labaKotor = Math.round(totalPenjualan * 0.31);

    const monthlyData = buildMonthlySeries(penjualanRows, pengirimanRows, 6);
    const annualData = buildMonthlySeries(penjualanRows, pengirimanRows, 12);

    const recentTransactions = penjualanRows.slice(0, 5).map((row) => ({
      id: row.id,
      customer: row.customer,
      region: row.region,
      amount: safeNum(row.amount),
    }));

    const monthlyTotals = monthlyData.map((item) => safeNum(item.penjualan));
    const avgMonthly = monthlyTotals.length
      ? monthlyTotals.reduce((sum, value) => sum + value, 0) / monthlyTotals.length
      : 0;

    const forecastData = avgMonthly > 0
      ? [
          { period: 'Proyeksi +1 Bulan', predicted: Math.round(avgMonthly * 1.05), confidence: 'Medium' },
          { period: 'Proyeksi +2 Bulan', predicted: Math.round(avgMonthly * 1.1), confidence: 'Medium' },
        ]
      : [];

    res.json({
      monthlyData,
      annualData,
      recentTransactions,
      forecastData,
      kpi: {
        totalPenjualan,
        labaKotor,
        jumlahTransaksi,
        rataRataNilai,
      },
    });
  } catch (error) {
    console.error('[DB] Dashboard error:', error);
    res.status(500).json({ message: 'Gagal mengambil data dashboard.' });
  }
});

app.get('/api/distribusi', authenticateToken, async (req, res) => {
  try {
    const pengirimanRows = await sql`SELECT * FROM pengiriman ORDER BY tanggal DESC`;
    const regionStats = {};

    pengirimanRows.forEach((row) => {
      const region = String(row.tujuan || 'Lainnya').split(' - ')[0];
      if (!regionStats[region]) {
        regionStats[region] = { region, deliveries: 0, onTime: 0, delayed: 0, distance: 0 };
      }
      regionStats[region].deliveries += 1;
      if (row.status === 'completed') regionStats[region].onTime += 1;
      if (row.status === 'delayed') regionStats[region].delayed += 1;
      regionStats[region].distance += safeNum(row.volume_liter || 50);
    });

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const weeklyTrend = dayNames.slice(1).concat(dayNames[0]).map((day) => ({ day, deliveries: 0 }));
    pengirimanRows.slice(0, 30).forEach((row) => {
      const day = dayNames[new Date(row.tanggal).getDay()];
      const target = weeklyTrend.find((item) => item.day === day);
      if (target) target.deliveries += 1;
    });

    const deliverySchedule = pengirimanRows.slice(0, 5).map((row) => ({
      time: new Date(row.tanggal).toLocaleDateString('id-ID'),
      deliveries: 1,
      status: row.status,
    }));

    res.json({
      distributionData: Object.values(regionStats),
      weeklyTrend,
      deliverySchedule,
    });
  } catch (error) {
    console.error('[DB] Distribusi error:', error);
    res.status(500).json({ message: 'Gagal mengambil data distribusi.' });
  }
});

app.get('/api/forecasting', authenticateToken, async (req, res) => {
  try {
    const penjualanRows = await sql`SELECT * FROM penjualan ORDER BY date ASC`;
    const monthlyActual = buildMonthlySeries(penjualanRows, [], 6);

    const historicalData = monthlyActual.map((item) => ({
      month: item.month,
      actual: safeNum(item.penjualan),
      predicted: Math.round(safeNum(item.penjualan) * 0.97),
    }));

    const lastActual = safeNum(historicalData.at(-1)?.actual || 0);
    const forecastData = lastActual > 0
      ? MONTHS_SHORT.slice(0, 6).map((month, index) => {
          const predicted = Math.round(lastActual * (1 + (index + 1) * 0.04));
          return {
            month,
            predicted,
            lower: Math.round(predicted * 0.92),
            upper: Math.round(predicted * 1.08),
            confidence: 90 - index * 2,
          };
        })
      : [];

    const totalActual = historicalData.reduce((sum, item) => sum + safeNum(item.actual), 0);
    const seasonalTrends = totalActual > 0
      ? [
          { quarter: 'Q1', value: Math.round(totalActual * 0.24), growth: 4.2 },
          { quarter: 'Q2', value: Math.round(totalActual * 0.28), growth: 6.8 },
        ]
      : [];

    const keyIndicators = lastActual > 0
      ? [
          { metric: 'Prediksi Bulan Depan', value: `Rp ${Math.round(lastActual * 1.05).toLocaleString('id-ID')}`, change: '+5%', status: 'positive', confidence: 'Medium' },
          { metric: 'Rata-rata Penjualan', value: `Rp ${Math.round(totalActual / Math.max(historicalData.length, 1)).toLocaleString('id-ID')}`, change: 'Stabil', status: 'on-track', confidence: 'High' },
        ]
      : [
          { metric: 'Data Historis', value: 'Belum tersedia', change: 'Tambahkan penjualan', status: 'on-track', confidence: 'Low' },
        ];

    res.json({ historicalData, forecastData, seasonalTrends, keyIndicators });
  } catch (error) {
    console.error('[DB] Forecasting error:', error);
    res.status(500).json({ message: 'Gagal mengambil data forecasting.' });
  }
});

app.get('/api/filter', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, hasFilter } = parseDateFilter(req.query);
    const penjualanRows = hasFilter
      ? await sql`
          SELECT * FROM penjualan
          WHERE date >= ${startDate}::date AND date <= ${endDate}::date
          ORDER BY date DESC
        `
      : await sql`SELECT * FROM penjualan ORDER BY date DESC`;

    const regionMap = {};
    penjualanRows.forEach((row) => {
      if (!regionMap[row.region]) {
        regionMap[row.region] = { region: row.region, value: 0, transactions: 0 };
      }
      regionMap[row.region].value += safeNum(row.amount);
      regionMap[row.region].transactions += 1;
    });

    const detailTransactions = penjualanRows.map((row) => ({
      id: row.id,
      date: row.date,
      customer: row.customer,
      product: row.region,
      qty: safeNum(row.volume_liter || 1),
      amount: safeNum(row.amount),
    }));

    res.json({
      regionData: Object.values(regionMap),
      detailTransactions,
    });
  } catch (error) {
    console.error('[DB] Filter error:', error);
    res.status(500).json({ message: 'Gagal mengambil data filter.' });
  }
});

app.get('/api/report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, hasFilter } = parseDateFilter(req.query);
    if (!hasFilter) {
      return res.status(400).json({ message: 'Parameter startDate dan endDate wajib diisi.' });
    }

    const [armada, driver, pengiriman, penjualan] = await Promise.all([
      sql`SELECT * FROM armada ORDER BY created_at DESC`,
      sql`SELECT * FROM driver ORDER BY created_at DESC`,
      sql`
        SELECT * FROM pengiriman
        WHERE tanggal >= ${startDate}::date AND tanggal <= ${endDate}::date
        ORDER BY tanggal DESC
      `,
      sql`
        SELECT * FROM penjualan
        WHERE date >= ${startDate}::date AND date <= ${endDate}::date
        ORDER BY date DESC
      `,
    ]);

    const totalPenjualan = penjualan.reduce((sum, row) => sum + safeNum(row.amount), 0);

    res.json({
      period: { startDate, endDate },
      summary: {
        totalArmada: armada.length,
        totalDriver: driver.length,
        totalPengiriman: pengiriman.length,
        totalPenjualan: penjualan.length,
        totalRevenue: totalPenjualan,
      },
      armada: armada.map((row) => ({
        noPolisi: row.plateNumber,
        merk: row.type,
        tahun: row.tahun || (row.lastService ? new Date(row.lastService).getFullYear() : '-'),
        kapasitasLiter: safeNum(row.kapasitas_liter || row.mileage || 0),
        status: row.status,
      })),
      driver: driver.map((row) => ({
        nama: row.name,
        nomorSim: row.nomor_sim || row.vehicle || '-',
        telepon: row.phone,
        status: row.status,
      })),
      pengiriman: pengiriman.map((row) => ({
        tanggal: row.tanggal,
        driver: row.driver_name || '-',
        armada: row.armada_id || '-',
        tujuan: row.tujuan,
        volumeLiter: safeNum(row.volume_liter || 0),
        status: row.status,
        catatan: row.catatan || '-',
      })),
      penjualan: penjualan.map((row) => ({
        tanggal: row.date,
        tujuan: row.customer,
        volumeLiter: safeNum(row.volume_liter || 0),
        hargaPerLiter: safeNum(row.harga_per_liter || 0),
        totalHarga: safeNum(row.amount),
        statusPembayaran: row.status_pembayaran || 'Lunas',
      })),
    });
  } catch (error) {
    console.error('[DB] Report error:', error);
    res.status(500).json({ message: 'Gagal membuat laporan.' });
  }
});

app.get('/api/db-status', authenticateToken, async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') as table_count,
        NOW() as current_time,
        current_database() as db_name
    `;
    const dbInfo = result[0];
    res.json({
      tables: Number(dbInfo.table_count),
      status: 'connected',
      now: dbInfo.current_time,
      database_name: dbInfo.db_name,
    });
  } catch (error) {
    console.error('DB Status Error:', error);
    res.status(500).json({ message: 'Gagal mendapatkan status database.' });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'PT Anugerah Bersama Bogor - BI System API',
    status: 'ok',
    timestamp: new Date().toISOString(),
    documentation: 'Akses endpoint melalui /api/...',
  });
});

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`[SERVER] Backend berjalan di http://localhost:${PORT}`);
    console.log(`[SERVER] Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
