/**
 * Database Connection Utility
 * Uses DATABASE_URL environment variable for PostgreSQL/Supabase connection
 * This file is server-side only - never expose DATABASE_URL to frontend
 */

import { Pool } from 'pg';

// Database connection pool using DATABASE_URL from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});

/**
 * Execute a query with parameters
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a single row from a query
 */
export async function queryOne(text: string, params?: any[]) {
  const res = await query(text, params);
  return res.rows[0];
}

/**
 * Initialize database schema if needed
 */
export async function initializeDatabase() {
  try {
    // Check if tables exist by querying one
    await query('SELECT 1 FROM users LIMIT 1');
    console.log('Database tables exist');
  } catch (error) {
    console.log('Database tables may not exist, run schema.sql to create them');
  }
}

export default pool;
