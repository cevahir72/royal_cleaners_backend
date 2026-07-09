const { Router } = require('express');
const { getHealth } = require('../controllers');
const orderRouter = require('./orderRouter');
const { trackReceipt, limiter } = require('../controllers/trackingController');

const router = Router();

router.get('/health', getHealth);
router.post('/order-status', limiter, trackReceipt);
router.use('/order', orderRouter);

module.exports = router;
