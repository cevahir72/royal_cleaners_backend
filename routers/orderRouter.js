const { Router } = require('express');
const { getNextOrder } = require('../controllers/orderController');

const router = Router();

router.get('/', getNextOrder);

module.exports = router;
