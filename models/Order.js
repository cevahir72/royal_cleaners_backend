const pool = require('../config/db');

const Order = {
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_no INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await pool.query(query);
  },

  async getNextOrderNo() {
    const { rows } = await pool.query('SELECT COALESCE(MAX(order_no), 0) AS max_no FROM orders');
    const nextNo = rows[0].max_no === 0 ? 10000 : rows[0].max_no + 1;

    await pool.query('INSERT INTO orders (order_no) VALUES ($1)', [nextNo]);

    return nextNo;
  },
};

module.exports = Order;
