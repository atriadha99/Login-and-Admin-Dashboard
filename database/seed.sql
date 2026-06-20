-- ============================================================
-- PT Anugerah Bersama Bogor - Seed Data (Sidang KP)
-- Jalankan: schema.sql -> migrate-report-columns.sql -> seed.sql
-- ============================================================

-- Password semua akun: password
-- Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO users (email, password_hash, nama, role)
VALUES
  ('admin@ptabb.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator',  'admin'),
  ('pemimpin@ptabb.id',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pemimpin Utama', 'pemimpin'),
  ('dosen@unpam.ac.id',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dosen Penguji',  'dispatcher')
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  nama = EXCLUDED.nama,
  role = EXCLUDED.role;
