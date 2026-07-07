const { Router } = require('express');
const { getHealth } = require('../controllers');
const orderRouter = require('./orderRouter');

const router = Router();

router.get('/health', getHealth);
router.use('/order', orderRouter);

module.exports = router;
