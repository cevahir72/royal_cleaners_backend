const pool = require('../config/db');

const Order = {
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_no INTEGER NOT NULL,
        receipt_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await pool.query(query);
  },

  async getNextOrderNo() {
    const { rows } = await pool.query('SELECT COALESCE(MAX(order_no), 0) AS max_no FROM orders');
    const nextNo = rows[0].max_no === 0 ? 10000 : rows[0].max_no + 1;

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const receiptId = `REC-${y}${m}${d}-${nextNo}`;

    await pool.query('INSERT INTO orders (order_no, receipt_id) VALUES ($1, $2)', [nextNo, receiptId]);

    return { orderNo: nextNo, receiptId };
  },
};

module.exports = Order;
