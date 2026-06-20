import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.DATABASE_URL);

const DEMO_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

const result = await sql`
  INSERT INTO users (email, password_hash, nama, role)
  VALUES ('dosen@unpam.ac.id', ${DEMO_HASH}, 'Dosen Penguji', 'dispatcher')
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    nama = EXCLUDED.nama,
    role = EXCLUDED.role
  RETURNING email, nama, role
`;

console.log('Akun dosen sidang siap:', result[0]);
