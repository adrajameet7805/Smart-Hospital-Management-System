const express = require('express');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-services:8000';

async function proxyToAi(path, options = {}) {
  const response = await fetch(`${AI_SERVICE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`AI service request failed with status ${response.status}`);
  }

  return data;
}

router.post('/command', async (req, res) => {
  try {
    const data = await proxyToAi('/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'AI Voice Service unavailable.' });
  }
});

router.get('/predictive', async (req, res) => {
  try {
    const data = await proxyToAi('/predictive');
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'AI Predictive Service unavailable.' });
  }
});

module.exports = router;
