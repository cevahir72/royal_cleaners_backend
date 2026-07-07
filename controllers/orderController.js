const Order = require('../models/Order');

const getNextOrder = async (req, res, next) => {
  try {
    const orderNo = await Order.getNextOrderNo();
    res.json({ order_no: orderNo });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNextOrder };
