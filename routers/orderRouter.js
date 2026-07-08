const { Router } = require('express');
const { getNextOrder, getLastReceiptId } = require('../controllers/orderController');

const router = Router();

router.post('/', getNextOrder);
router.get('/last-receipt', getLastReceiptId);

module.exports = router;
