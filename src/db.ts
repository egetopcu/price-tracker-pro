import dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = postgres(process.env.DATABASE_URL);

export default sql;