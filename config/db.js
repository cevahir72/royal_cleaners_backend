const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  max: 10,
});

pool.on('connect', () => {
  console.log('[DB] PostgreSQL bağlantısı kuruldu.');
});

pool.on('error', (err) => {
  console.error('[DB] PostgreSQL bağlantı hatası:', err.message);
});

module.exports = pool;
