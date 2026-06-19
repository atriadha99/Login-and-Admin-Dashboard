import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.DATABASE_URL);

const columns = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'users'
  ORDER BY ordinal_position
`;
console.log(JSON.stringify(columns, null, 2));

const sample = await sql`SELECT * FROM users LIMIT 3`;
console.log('Sample rows:', JSON.stringify(sample, null, 2));
