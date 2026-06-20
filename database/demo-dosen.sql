-- Akun dosen sidang KP
INSERT INTO users (email, password_hash, nama, role)
VALUES (
  'dosen@unpam.ac.id',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Dosen Penguji',
  'dispatcher'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  nama = EXCLUDED.nama,
  role = EXCLUDED.role;
