const axios = require('axios');
const rateLimit = require('express-rate-limit');

const GHL_BASE = 'https://services.leadconnectorhq.com';
const HEADERS = {
  Authorization: `Bearer ${process.env.GHL_PIT_TOKEN}`,
  Version: '2021-07-28',
  'Content-Type': 'application/json',
};

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

async function findContactByEmail(email) {
  const { data } = await axios.get(`${GHL_BASE}/contacts/`, {
    headers: HEADERS,
    params: {
      locationId: process.env.GHL_LOCATION_ID,
      query: email,
      limit: 5,
    },
  });
  return data.contacts?.find(
    (c) => c.email?.toLowerCase() === email.toLowerCase()
  );
}

async function getOpportunitiesForContact(contactId) {
  const { data } = await axios.get(`${GHL_BASE}/opportunities/search`, {
    headers: HEADERS,
    params: {
      location_id: process.env.GHL_LOCATION_ID,
      contact_id: contactId,
    },
  });
  return data.opportunities || [];
}

function getCustomFieldValue(opportunity, fieldId) {
  const field = opportunity.customFields?.find((f) => f.id === fieldId);
  return field?.fieldValueString ?? field?.fieldValue ?? null;
}

const trackReceipt = async (req, res, next) => {
  const { email, receiptId } = req.body;

  if (!email || !receiptId) {
    return res.status(400).json({ error: 'email ve receiptId zorunlu' });
  }

  try {
    const contact = await findContactByEmail(email);
    if (!contact) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    const opportunities = await getOpportunitiesForContact(contact.id);

    const matched = opportunities.find((opp) => {
      const rid = getCustomFieldValue(opp, process.env.GHL_FIELD_RECEIPT_ID);
      return rid?.trim().toUpperCase() === receiptId.trim().toUpperCase();
    });

    if (!matched) {
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    }

    const status = getCustomFieldValue(
      matched,
      process.env.GHL_FIELD_ORDER_STATUS
    );

    return res.json({
      receiptId,
      status: status || 'UNKNOWN',
      pipelineStageId: matched.pipelineStageId,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = { trackReceipt, limiter };
