const Order = require('../models/Order');

const LEAD_CONNECTOR_TOKEN = process.env.LEAD_CONNECTOR_TOKEN;
const LEAD_CONNECTOR_API_BASE = (process.env.LEAD_CONNECTOR_API_URL || 'https://services.leadconnectorhq.com/contacts').replace(/\/contacts\/?$/i, '') || 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
const RECEIPT_ID_FIELD_KEY = 'receipt_id';

function extractField(data, key) {
  const topLevel = data[key];
  if (topLevel != null && String(topLevel).trim() !== '') {
    return String(topLevel).trim();
  }

  if (data.customData && typeof data.customData === 'object') {
    const nested = data.customData[key];
    if (nested != null && String(nested).trim() !== '') {
      return String(nested).trim();
    }
  }

  return '';
}

const getNextOrder = async (req, res, next) => {
  try {
    const data = req.body;

    const contactId = extractField(data, 'contact_id');
    const opportunityId = extractField(data, 'opportunity_id');

    if (!contactId || !opportunityId) {
      return res.status(422).json({
        success: false,
        error: 'contact_id and opportunity_id are required',
        debug: {
          received_keys: Object.keys(data),
          received_payload: data,
        },
      });
    }

    const { receiptId } = await Order.getNextOrderNo();

    const url = `${LEAD_CONNECTOR_API_BASE}/opportunities/${encodeURIComponent(opportunityId)}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${LEAD_CONNECTOR_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Version: GHL_API_VERSION,
      },
      body: JSON.stringify({
        customFields: [
          {
            key: RECEIPT_ID_FIELD_KEY,
            field_value: receiptId,
          },
        ],
      }),
    });

    const httpCode = response.status;
    let ghlResponse;
    try {
      ghlResponse = await response.json();
    } catch {
      ghlResponse = null;
    }

    if (httpCode >= 200 && httpCode < 300) {
      return res.json({
        success: true,
        contact_id: contactId,
        opportunity_id: opportunityId,
        receipt_id: receiptId,
        ghl_response: ghlResponse,
      });
    }

    return res.status(httpCode).json({
      success: false,
      error: 'GHL API request failed',
      ghl_response: ghlResponse,
    });
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return res.status(502).json({
        success: false,
        error: `GHL API network error: ${err.message}`,
      });
    }
    next(err);
  }
};

module.exports = { getNextOrder };
