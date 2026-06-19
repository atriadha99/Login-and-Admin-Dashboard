-- ============================================================
-- FIX: users_role_check constraint error
-- Jalankan ini di Neon SQL Editor SEBELUM seed.sql
-- ============================================================

-- Hapus constraint lama (bisa beda isinya: Admin/Pemimpin atau admin saja)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Normalisasi data role yang sudah ada ke format lowercase
UPDATE users
SET role = LOWER(TRIM(role))
WHERE role IS NOT NULL;

-- Mapping role lama / variasi ke role yang dipakai aplikasi
UPDATE users SET role = 'admin'
WHERE role IN ('administrator', 'admin', 'admin ');

UPDATE users SET role = 'pemimpin'
WHERE role IN ('pemimpin', 'leader', 'dosen', 'pimpinan');

UPDATE users SET role = 'dispatcher'
WHERE role IN ('dispatcher', 'dispatch', 'operator');

-- Pasang constraint baru (sesuai backend index.js)
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'pemimpin', 'dispatcher'));
