// Simple in-memory store for cross-device photo transfer
// Photos are stored by session ID and auto-expire after 5 minutes
const photos = global._photoStore || (global._photoStore = new Map());

module.exports = (req, res) => {
  // CORS headers
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

  if (req.method === 'POST') {
    // Store photo data
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        photos.set(sessionId, {
          dataUrl: data.dataUrl,
          timestamp: Date.now(),
        });
        // Clean up old entries (older than 5 min)
        for (const [key, val] of photos) {
          if (Date.now() - val.timestamp > 300000) photos.delete(key);
        }
        return res.status(200).json({ ok: true });
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    });
  } else if (req.method === 'GET') {
    // Retrieve photo data
    const entry = photos.get(sessionId);
    if (entry) {
      return res.status(200).json({ found: true, dataUrl: entry.dataUrl });
    }
    return res.status(200).json({ found: false });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};
