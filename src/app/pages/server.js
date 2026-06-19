import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ganti URL ini dengan URI dari Neon Anda di file .env (DATABASE_URL)
const sql = neon(process.env.DATABASE_URL || 'postgresql://<user>:<password>@<ep-hostname>.neon.tech/<dbname>?sslmode=require');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'; // Ganti dengan secret key yang kuat di .env
const SALT_ROUNDS = 10;

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
app.get('/api/armada', authenticateToken, (req, res) => handleRequest(res, () => sql`SELECT * FROM armada ORDER BY id DESC`));

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
app.get('/api/driver', authenticateToken, (req, res) => handleRequest(res, () => sql`SELECT * FROM driver ORDER BY id DESC`));

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
app.get('/api/pengiriman', authenticateToken, (req, res) => handleRequest(res, () => sql`SELECT * FROM pengiriman ORDER BY id DESC`));

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
app.get('/api/penjualan', authenticateToken, (req, res) => handleRequest(res, () => sql`SELECT * FROM penjualan ORDER BY date DESC`));

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
app.get('/api/users', authenticateToken, (req, res) => handleRequest(res, () => sql`SELECT id, name, email, role FROM users ORDER BY id DESC`));

app.get('/api/users/:id', authenticateToken, (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT id, name, email, role FROM users WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/users', authenticateToken, async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new Error("Missing required fields");

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await sql`
      INSERT INTO users (name, email, password, role) 
      VALUES (${name}, ${email}, ${hashedPassword}, ${role})
      RETURNING id, name, email, role
    `;
    res.status(201).json(result[0]);
  } catch (error) {
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
        UPDATE users SET name = ${name}, email = ${email}, password = ${hashedPassword}, role = ${role}
        WHERE id = ${req.params.id} RETURNING id, name, email, role`;
    } else {
      result = await sql`
        UPDATE users SET name = ${name}, email = ${email}, role = ${role}
        WHERE id = ${req.params.id} RETURNING id, name, email, role`;
    }
    res.json(result[0]);
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Gagal memperbarui pengguna.' });
  }
});

app.delete('/api/users/:id', authenticateToken, (req, res) => handleRequest(res, () => sql`DELETE FROM users WHERE id = ${req.params.id} RETURNING id, name, email, role`));

// --- AUTHENTICATION ---

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
  }

  try {
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await sql`
      INSERT INTO users (name, email, password, role) 
      VALUES (${name}, ${email.toLowerCase()}, ${hashedPassword}, ${role})
      RETURNING id, name, email, role
    `;

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Register Error:', error);
    // Kirim pesan error yang lebih spesifik ke frontend
    let errorMessage = 'Terjadi kesalahan pada server saat registrasi.';
    if (error instanceof Error) {
      errorMessage = error.message.includes('users_email_key') ? 'Email sudah terdaftar.' : `Database Error: ${error.message}`;
    }
    res.status(500).json({ message: errorMessage });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, dan role wajib diisi.' });
  }

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} AND role = ${role}`;
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email, password, atau role salah.' });
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email, password, atau role salah.' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, name: user.name, role: user.role });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.' });
  }
});

// --- MOCK DATA ENDPOINTS (Dashboard, Distribusi, etc.) ---

app.get('/api/dashboard', authenticateToken, (req, res) => {
  const mockData = {
    monthlyData: [
      { month: 'Jan', penjualan: 45000000, distribusi: 42000000 },
      { month: 'Feb', penjualan: 52000000, distribusi: 48000000 },
      { month: 'Mar', penjualan: 48000000, distribusi: 47000000 },
      { month: 'Apr', penjualan: 61000000, distribusi: 58000000 },
      { month: 'Mei', penjualan: 55000000, distribusi: 52000000 },
      { month: 'Jun', penjualan: 67000000, distribusi: 65000000 },
    ],
    annualData: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      penjualan: Math.floor(Math.random() * (70 - 40) + 40) * 1000000,
      distribusi: Math.floor(Math.random() * (68 - 38) + 38) * 1000000,
    })),
    recentTransactions: [
      { id: 'TRX-001', customer: 'Toko Sejahtera', region: 'Cibinong', amount: 2500000 },
      { id: 'TRX-002', customer: 'Warung Berkah', region: 'Bogor Utara', amount: 1800000 },
      { id: 'TRX-003', customer: 'Agen Jaya', region: 'Ciawi', amount: 3200000 },
    ],
    forecastData: [
      { period: 'Q3 2026', predicted: 210000000, confidence: 'High' },
      { period: 'Q4 2026', predicted: 245000000, confidence: 'Medium' },
    ],
    kpi: {
      totalPenjualan: 67000000,
      labaKotor: 21000000,
      jumlahTransaksi: 152,
      rataRataNilai: 440789,
    },
  };
  res.json(mockData);
});

app.get('/api/distribusi', authenticateToken, (req, res) => {
  const mockData = {
    distributionData: [
      { region: 'Bogor Utara', deliveries: 156, onTime: 148, delayed: 8, distance: 1240 },
      { region: 'Cibinong', deliveries: 178, onTime: 172, delayed: 6, distance: 1520 },
      { region: 'Bogor Barat', deliveries: 142, onTime: 138, delayed: 4, distance: 1180 },
      { region: 'Bogor Selatan', deliveries: 135, onTime: 131, delayed: 4, distance: 1150 },
      { region: 'Bogor Timur', deliveries: 128, onTime: 125, delayed: 3, distance: 1050 },
      { region: 'Ciawi', deliveries: 110, onTime: 108, delayed: 2, distance: 980 },
    ],
    weeklyTrend: [
      { day: 'Sen', deliveries: 120 }, { day: 'Sel', deliveries: 135 },
      { day: 'Rab', deliveries: 140 }, { day: 'Kam', deliveries: 155 },
      { day: 'Jum', deliveries: 160 }, { day: 'Sab', deliveries: 180 },
      { day: 'Min', deliveries: 90 },
    ],
    deliverySchedule: [
      { time: '08:00 - 10:00', deliveries: 45, status: 'completed' },
      { time: '10:00 - 12:00', deliveries: 52, status: 'in-progress' },
      { time: '13:00 - 15:00', deliveries: 60, status: 'scheduled' },
    ],
  };
  res.json(mockData);
});

app.get('/api/forecasting', authenticateToken, (req, res) => {
  const mockData = {
    historicalData: [
      { month: 'Jan', actual: 45, predicted: 44 }, { month: 'Feb', actual: 52, predicted: 50 },
      { month: 'Mar', actual: 48, predicted: 49 }, { month: 'Apr', actual: 61, predicted: 58 },
      { month: 'Mei', actual: 55, predicted: 56 }, { month: 'Jun', actual: 67, predicted: 65 },
    ].map(d => ({ ...d, actual: d.actual * 1000000, predicted: d.predicted * 1000000 })),
    forecastData: [
      { month: 'Jul', predicted: 72000000, lower: 68000000, upper: 76000000, confidence: 95 },
      { month: 'Agu', predicted: 75000000, lower: 70000000, upper: 80000000, confidence: 92 },
      { month: 'Sep', predicted: 81000000, lower: 75000000, upper: 87000000, confidence: 90 },
      { month: 'Okt', predicted: 85000000, lower: 78000000, upper: 92000000, confidence: 88 },
      { month: 'Nov', predicted: 88000000, lower: 80000000, upper: 96000000, confidence: 85 },
      { month: 'Des', predicted: 95000000, lower: 85000000, upper: 105000000, confidence: 82 },
    ],
    seasonalTrends: [
      { quarter: 'Q1 2026', value: 145000000, growth: 5.2 },
      { quarter: 'Q2 2026', value: 183000000, growth: 8.1 },
      { quarter: 'Q3 2026 (Pred)', value: 228000000, growth: 12.5 },
      { quarter: 'Q4 2026 (Pred)', value: 268000000, growth: 15.1 },
    ],
    keyIndicators: [
      { metric: 'Prediksi Revenue Q3', value: 'Rp 228M', change: '+12.5% vs Q2', status: 'positive', confidence: 'High' },
      { metric: 'Akurasi Model', value: '94.2%', change: 'Stabil', status: 'on-track', confidence: 'High' },
      { metric: 'Pertumbuhan YoY', value: '+28%', change: 'Tren positif', status: 'positive', confidence: 'Medium' },
      { metric: 'Risiko Penurunan', value: 'Rendah', change: 'Faktor eksternal stabil', status: 'on-track', confidence: 'Medium' },
    ],
  };
  res.json(mockData);
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

app.get('/api/filter', authenticateToken, (req, res) => {
  const mockData = {
    regionData: [
      { region: 'Bogor Utara', value: 45000000, transactions: 120 },
      { region: 'Cibinong', value: 52000000, transactions: 150 },
      { region: 'Bogor Barat', value: 42000000, transactions: 110 },
      { region: 'Bogor Selatan', value: 38000000, transactions: 100 },
      { region: 'Bogor Timur', value: 35000000, transactions: 95 },
      { region: 'Ciawi', value: 28000000, transactions: 80 },
    ],
    detailTransactions: [
      { id: 'TRX-101', date: '2026-04-15', customer: 'Agen Sejahtera', product: 'Galon 19L', qty: 50, amount: 1500000 },
      { id: 'TRX-102', date: '2026-04-16', customer: 'Toko Maju', product: 'Cup 240ml', qty: 200, amount: 800000 },
      { id: 'TRX-103', date: '2026-04-18', customer: 'Warung Barokah', product: 'Botol 600ml', qty: 120, amount: 600000 },
    ],
  };
  res.json(mockData);
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'PT Anugerah Bersama Bogor - BI System API',
    status: 'ok',
    timestamp: new Date().toISOString(),
    documentation: 'Akses endpoint melalui /api/...',
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});