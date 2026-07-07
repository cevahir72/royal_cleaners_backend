const getHealth = (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
};

module.exports = { getHealth };
