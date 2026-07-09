const axios = require('axios');
const rateLimit = require('express-rate-limit');

const stages = [
  { id: '6a08383c-7844-4be7-b1aa-26f0c4633d05', name: 'New Lead' },
  { id: 'bbd2d5b1-48b6-471c-9347-0488ad317188', name: 'Order Taken' },
  { id: 'a11298ce-9040-4c22-aaff-202f2b57d1a9', name: 'In Progress' },
  { id: 'caf55504-0372-4ae8-95e0-fe37bd27604c', name: 'Ready for Pickup' },
  { id: '11e17c8a-de0e-48df-9c95-da3521284f86', name: 'Completed' },
];

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
      return res.status(404).json({ error: 'No matching record found' });
    }

    const matchedStage = stages.find((s) => s.id === matched.pipelineStageId);
    const status = matchedStage?.name || 'UNKNOWN';

    return res.json({
      receiptId,
      status,
      pipelineStageId: matched.pipelineStageId,
      stages,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { trackReceipt, limiter };
