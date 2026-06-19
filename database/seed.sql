-- ============================================================
-- PT Anugerah Bersama Bogor - Seed Data
-- Jalankan setelah schema.sql
--
-- Jika error users_role_check:
--   jalankan dulu database/migrate-users-role.sql
-- ============================================================

-- ------------------------------------------------------------
-- USERS
-- Password default semua akun di bawah: password
-- Hash bcrypt: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ------------------------------------------------------------
INSERT INTO users (email, password_hash, nama, role)
VALUES
  ('admin@ptabb.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator',  'admin'),
  ('pemimpin@ptabb.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pemimpin Utama', 'pemimpin'),
  ('dispatcher@ptabb.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dispatcher Ops', 'dispatcher')
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- ARMADA (contoh data)
-- ------------------------------------------------------------
INSERT INTO armada (id, "plateNumber", type, driver, status, "lastService", "nextService", "totalTrips", mileage)
VALUES
  ('arm001', 'B 1234 AB', 'Truck Box', 'Budi Santoso',   'active',      '2026-03-01', '2026-06-01', 128, 45200),
  ('arm002', 'B 5678 CD', 'Pickup',    'Andi Wijaya',    'idle',        '2026-02-15', '2026-05-15',  86, 32100),
  ('arm003', 'B 9012 EF', 'Truck Box', 'Rizki Pratama',  'maintenance', '2026-04-10', '2026-07-10', 142, 51800)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- DRIVER (contoh data)
-- ------------------------------------------------------------
INSERT INTO driver (id, name, phone, vehicle, status, rating, "totalTrips", "completedTrips", revenue, "joinDate")
VALUES
  ('drv001', 'Budi Santoso',   '081234567890', 'B 1234 AB', 'on-trip',   4.80, 128, 125, 51200000, '2024-01-15'),
  ('drv002', 'Andi Wijaya',    '081298765432', 'B 5678 CD', 'available', 4.65,  86,  84, 34800000, '2024-06-20'),
  ('drv003', 'Rizki Pratama',  '081276543210', 'B 9012 EF', 'off-duty',  4.90, 142, 140, 56800000, '2023-11-08'),
  ('drv004', 'Dedi Kurniawan', '081345678901', 'B 3456 GH', 'available', 4.55,  95,  92, 37600000, '2025-02-01')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- PENGIRIMAN (contoh data)
-- ------------------------------------------------------------
INSERT INTO pengiriman (id, tanggal, tujuan, status)
VALUES
  ('pgm001', '2026-04-15', 'Bogor Utara - Toko Sejahtera', 'completed'),
  ('pgm002', '2026-04-16', 'Cibinong - Agen Jaya',         'in-progress'),
  ('pgm003', '2026-04-17', 'Ciawi - Warung Berkah',        'scheduled'),
  ('pgm004', '2026-04-18', 'Bogor Barat - Distribusi A',     'delayed')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- PENJUALAN (contoh data)
-- ------------------------------------------------------------
INSERT INTO penjualan (id, customer, amount, date, region)
VALUES
  ('trx001', 'Toko Sejahtera',  2500000, '2026-04-15', 'Bogor Utara'),
  ('trx002', 'Warung Berkah',   1800000, '2026-04-16', 'Cibinong'),
  ('trx003', 'Agen Jaya',       3200000, '2026-04-16', 'Ciawi'),
  ('trx004', 'Toko Maju',        800000, '2026-04-17', 'Bogor Barat'),
  ('trx005', 'Warung Barokah',   600000, '2026-04-18', 'Bogor Selatan'),
  ('trx006', 'Distribusi A',    4100000, '2026-04-18', 'Bogor Timur')
ON CONFLICT (id) DO NOTHING;
