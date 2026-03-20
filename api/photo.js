const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sessionId = req.query.session;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  const key = `photo:${sessionId}`;

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        // Store with 5-minute expiry
        await redis.set(key, data.dataUrl, { ex: 300 });
        return res.status(200).json({ ok: true });
      } catch (e) {
        return res.status(400).json({ error: 'Failed to store photo' });
      }
    });
  } else if (req.method === 'GET') {
    try {
      const dataUrl = await redis.get(key);
      if (dataUrl) {
        return res.status(200).json({ found: true, dataUrl });
      }
      return res.status(200).json({ found: false });
    } catch (e) {
      return res.status(200).json({ found: false });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};
