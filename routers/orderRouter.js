const { Router } = require('express');
const { getNextOrder } = require('../controllers/orderController');

const router = Router();

router.post('/', getNextOrder);

module.exports = router;
