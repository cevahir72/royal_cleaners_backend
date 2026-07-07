const Order = require('../models/Order');

const LEAD_CONNECTOR_TOKEN = process.env.LEAD_CONNECTOR_TOKEN;
const LEAD_CONNECTOR_API_URL = process.env.LEAD_CONNECTOR_API_URL;
const RECEIPT_CUSTOM_FIELD_ID = 'receipt_id';

const getNextOrder = async (req, res, next) => {
  try {
    const { contactId, opportunityId } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: 'contactId is required' });
    }

    const orderNo = await Order.getNextOrderNo();

    await fetch(
      `${LEAD_CONNECTOR_API_URL}/${contactId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${LEAD_CONNECTOR_TOKEN}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customFields: [
            {
              id: RECEIPT_CUSTOM_FIELD_ID,
              value: orderNo,
            },
          ],
        }),
      }
    );

    res.json({ order_no: orderNo, message: 'contactId has been updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNextOrder };
