const express = require('express');
const router = express.Router();
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-services:8000';

// Proxy voice command to Python FastAPI
router.post('/command', async (req, res) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/command`, req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(502).json({ error: 'AI Voice Service unavailable.' });
  }
});

// Proxy predictive analytics to Python FastAPI
router.get('/predictive', async (req, res) => {
  try {
    const response = await axios.get(
      `${AI_SERVICE_URL}/predictive`
    );
    res.json(response.data);
  } catch (err) {
    res.status(502).json({ error: 'AI Predictive Service unavailable.' });
  }
});

module.exports = router;
