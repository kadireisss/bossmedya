import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const now = Date.now();
  const ONLINE_WINDOW = 180000; // 3 dakika

  const ua = req.headers['user-agent'] || 'unknown';
  const ip =
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '0.0.0.0';

  const page = (req.query.page || req.headers.referer || '/').toString();
  const ref = (req.query.ref || req.headers.referer || '').toString();
  const country = (req.headers['cf-ipcountry'] || 'XX').toString();

  const base = ip + '|' + ua;
  const sessionId = Buffer.from(base).toString('base64').replace(/=/g, '').slice(0, 40);
  const sessionKey = `sess:${sessionId}`;

  const uaLower = ua.toLowerCase();
  let device = 'Desktop';
  if (uaLower.includes('mobile') || uaLower.includes('android') || uaLower.includes('iphone')) device = 'Mobile';
  if (uaLower.includes('tablet') || uaLower.includes('ipad')) device = 'Tablet';

  const existing = await kv.hgetall(sessionKey);

  const firstSeen = existing && existing.first_seen ? Number(existing.first_seen) : now;
  const hits = existing && existing.hits ? Number(existing.hits) + 1 : 1;

  await kv.hset(sessionKey, {
    ip,
    ua,
    device,
    country,
    page,
    ref,
    first_seen: firstSeen,
    last_seen: now,
    hits
  });

  // Oturum 30 gün geçerli
  await kv.expire(sessionKey, 60 * 60 * 24 * 30);

  // Online listesi
  await kv.zadd('online_sessions', { score: now, member: sessionId });
  const minScore = now - ONLINE_WINDOW;
  await kv.zremrangebyscore('online_sessions', 0, minScore);

  const onlineCount = await kv.zcard('online_sessions');

  res.status(200).json({
    online: onlineCount,
    page,
    timestamp: now
  });
}
