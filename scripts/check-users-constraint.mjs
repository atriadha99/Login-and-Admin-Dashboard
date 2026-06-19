import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.DATABASE_URL);

const constraints = await sql`
  SELECT conname, pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conrelid = 'users'::regclass
`;
console.log('Constraints:', JSON.stringify(constraints, null, 2));

const roles = await sql`SELECT DISTINCT role FROM users`;
console.log('Existing roles:', JSON.stringify(roles, null, 2));
