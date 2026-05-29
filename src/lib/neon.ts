import { neon } from '@neondatabase/serverless';

const connectionString = import.meta.env.VITE_NEON_DATABASE_URL as string | undefined;

export const sql = connectionString ? neon(connectionString) : null;

export async function testNeonConnection() {
  if (!sql) {
    throw new Error('VITE_NEON_DATABASE_URL is not configured.');
  }

  const rows = await sql`SELECT NOW() AS now_at, current_database() AS database_name, current_user AS user_name`;
  return rows[0] as {
    now_at: string;
    database_name: string;
    user_name: string;
  };
}
