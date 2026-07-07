const pool = require('./db');
const Order = require('../models/Order');

async function syncDatabase() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('[DB] Senkronizasyon başarılı - Sunucu saati:', result.rows[0].now);

    await Order.createTable();
    console.log('[DB] orders tablosu hazır.');
  } catch (err) {
    console.error('[DB] Senkronizasyon hatası:', err.message);
    process.exit(1);
  }
}

module.exports = syncDatabase;
