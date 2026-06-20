import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.DATABASE_URL);

const statements = [
  `ALTER TABLE armada ADD COLUMN IF NOT EXISTS tahun INTEGER`,
  `ALTER TABLE armada ADD COLUMN IF NOT EXISTS kapasitas_liter INTEGER DEFAULT 0`,
  `ALTER TABLE driver ADD COLUMN IF NOT EXISTS nomor_sim TEXT`,
  `ALTER TABLE pengiriman ADD COLUMN IF NOT EXISTS driver_name TEXT`,
  `ALTER TABLE pengiriman ADD COLUMN IF NOT EXISTS armada_id TEXT`,
  `ALTER TABLE pengiriman ADD COLUMN IF NOT EXISTS volume_liter INTEGER DEFAULT 0`,
  `ALTER TABLE pengiriman ADD COLUMN IF NOT EXISTS catatan TEXT`,
  `ALTER TABLE penjualan ADD COLUMN IF NOT EXISTS volume_liter INTEGER DEFAULT 0`,
  `ALTER TABLE penjualan ADD COLUMN IF NOT EXISTS harga_per_liter BIGINT DEFAULT 0`,
  `ALTER TABLE penjualan ADD COLUMN IF NOT EXISTS status_pembayaran TEXT DEFAULT 'Lunas'`,
];

for (const statement of statements) {
  await sql(statement);
  console.log('OK:', statement.slice(0, 60));
}

console.log('Migration selesai.');
