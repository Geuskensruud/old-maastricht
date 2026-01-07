// lib/db.ts
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is niet gezet. Zet deze in je .env(.local)');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // vaak nodig voor Neon / hosted Postgres
  },
});

async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const result = await pool.query(text, params);
  return {
    rows: result.rows as T[],
    rowCount: result.rowCount ?? null,
  };
}

export default {
  query,
};
