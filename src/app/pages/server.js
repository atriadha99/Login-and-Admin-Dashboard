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
app.get('/api/armada', (req, res) => handleRequest(res, () => sql`SELECT * FROM armada ORDER BY id DESC`));

app.get('/api/armada/:id', (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT * FROM armada WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/armada', (req, res) => handleRequest(res, () => {
  const { id, plateNumber, type, driver, status, lastService, nextService, totalTrips, mileage } = req.body;
  if (!id || !plateNumber || !type) throw new Error("Missing required fields");
  return sql`
    INSERT INTO armada (id, "plateNumber", type, driver, status, "lastService", "nextService", "totalTrips", mileage) 
    VALUES (${id}, ${plateNumber}, ${type}, ${driver}, ${status}, ${lastService}, ${nextService}, ${totalTrips}, ${mileage})
    RETURNING *
  `;
}));

app.put('/api/armada/:id', (req, res) => handleRequest(res, () => {
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

app.delete('/api/armada/:id', (req, res) => handleRequest(res, () => sql`DELETE FROM armada WHERE id = ${req.params.id} RETURNING *`));

// --- DRIVER ---
app.get('/api/driver', (req, res) => handleRequest(res, () => sql`SELECT * FROM driver ORDER BY id DESC`));

app.get('/api/driver/:id', (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT * FROM driver WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/driver', (req, res) => handleRequest(res, () => {
  const { id, name, phone, vehicle, status, rating, totalTrips, completedTrips, revenue, joinDate } = req.body;
  if (!id || !name || !phone) throw new Error("Missing required fields");
  return sql`
    INSERT INTO driver (id, name, phone, vehicle, status, rating, "totalTrips", "completedTrips", revenue, "joinDate") 
    VALUES (${id}, ${name}, ${phone}, ${vehicle}, ${status}, ${rating}, ${totalTrips}, ${completedTrips}, ${revenue}, ${joinDate})
    RETURNING *
  `;
}));

app.put('/api/driver/:id', (req, res) => handleRequest(res, () => {
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

app.delete('/api/driver/:id', (req, res) => handleRequest(res, () => sql`DELETE FROM driver WHERE id = ${req.params.id} RETURNING *`));

// --- PENGIRIMAN ---
app.get('/api/pengiriman', (req, res) => handleRequest(res, () => sql`SELECT * FROM pengiriman ORDER BY id DESC`));

app.get('/api/pengiriman/:id', (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT * FROM pengiriman WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/pengiriman', (req, res) => handleRequest(res, () => {
  const { id, tanggal, tujuan, status } = req.body;
  if (!id || !tanggal || !tujuan) throw new Error("Missing required fields");
  return sql`
    INSERT INTO pengiriman (id, tanggal, tujuan, status) 
    VALUES (${id}, ${tanggal}, ${tujuan}, ${status})
    RETURNING *
  `;
}));

app.put('/api/pengiriman/:id', (req, res) => handleRequest(res, () => {
  const { tanggal, tujuan, status } = req.body;
  if (!tanggal || !tujuan) throw new Error("Missing required fields");
  return sql`
    UPDATE pengiriman SET tanggal = ${tanggal}, tujuan = ${tujuan}, status = ${status}
    WHERE id = ${req.params.id}
    RETURNING *
  `;
}));

app.delete('/api/pengiriman/:id', (req, res) => handleRequest(res, () => sql`DELETE FROM pengiriman WHERE id = ${req.params.id} RETURNING *`));

// --- PENJUALAN ---
app.get('/api/penjualan', (req, res) => handleRequest(res, () => sql`SELECT * FROM penjualan ORDER BY date DESC`));

app.get('/api/penjualan/:id', (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT * FROM penjualan WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/penjualan', (req, res) => handleRequest(res, () => {
  const { id, customer, amount, date, region } = req.body;
  if (!id || !customer || !amount) throw new Error("Missing required fields");
  return sql`
    INSERT INTO penjualan (id, customer, amount, date, region) 
    VALUES (${id}, ${customer}, ${amount}, ${date}, ${region})
    RETURNING *
  `;
}));

app.put('/api/penjualan/:id', (req, res) => handleRequest(res, () => {
  const { customer, amount, date, region } = req.body;
  if (!customer || !amount) throw new Error("Missing required fields");
  return sql`
    UPDATE penjualan SET customer = ${customer}, amount = ${amount}, date = ${date}, region = ${region}
    WHERE id = ${req.params.id}
    RETURNING *
  `;
}));

app.delete('/api/penjualan/:id', (req, res) => handleRequest(res, () => sql`DELETE FROM penjualan WHERE id = ${req.params.id} RETURNING *`));

// --- USERS ---
app.get('/api/users', (req, res) => handleRequest(res, () => sql`SELECT id, name, email, role FROM users ORDER BY id DESC`));

app.get('/api/users/:id', (req, res) => handleRequest(res, async () => {
  const result = await sql`SELECT id, name, email, role FROM users WHERE id = ${req.params.id}`;
  return result[0];
}));

app.post('/api/users', (req, res) => handleRequest(res, () => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new Error("Missing required fields");
  return sql`
    INSERT INTO users (name, email, password, role) 
    VALUES (${name}, ${email}, ${password}, ${role})
    RETURNING id, name, email, role
  `;
}));

app.put('/api/users/:id', (req, res) => handleRequest(res, () => {
  const { name, email, password, role } = req.body;
  if (!name || !email) throw new Error("Missing required fields");
  if (password) {
    return sql`
      UPDATE users SET name = ${name}, email = ${email}, password = ${password}, role = ${role}
      WHERE id = ${req.params.id}
      RETURNING id, name, email, role
    `;
  } else {
    return sql`
      UPDATE users SET name = ${name}, email = ${email}, role = ${role}
      WHERE id = ${req.params.id}
      RETURNING id, name, email, role
    `;
  }
}));

app.delete('/api/users/:id', (req, res) => handleRequest(res, () => sql`DELETE FROM users WHERE id = ${req.params.id} RETURNING id, name, email, role`));

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
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat registrasi.' });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Server backend berjalan di http://localhost:\${PORT}\`);
});