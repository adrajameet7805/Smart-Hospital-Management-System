const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'smart_hospital',
  user: process.env.DB_USER || 'hospital_admin',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err);
  process.exit(1);
});

/**
 * Initialize database with migration scripts
 */
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, '..', '..', '..', 'database', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        await client.query(sql);
        console.log(`✅ Migration applied: ${file}`);
      }
    }
  } catch (err) {
    // Ignore "already exists" errors for idempotent migrations
    if (!err.message.includes('already exists')) {
      console.warn(`⚠️  Migration warning: ${err.message}`);
    }
  } finally {
    client.release();
  }
}

/**
 * Execute a query and return all rows
 */
async function queryAll(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

/**
 * Execute a query and return the first row
 */
async function queryOne(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

/**
 * Run an INSERT/UPDATE/DELETE and return result info
 */
async function runQuery(sql, params = []) {
  const result = await pool.query(sql, params);
  return { rowCount: result.rowCount, rows: result.rows };
}

module.exports = { pool, initializeDatabase, queryAll, queryOne, runQuery };
