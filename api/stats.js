import { kv } from '@vercel/kv';

function topN(map, n = 10) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const adminKey = process.env.ADMIN_KEY || 'changeme';
  const key = (req.query.key || '').toString();
  if (key !== adminKey) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  const now = Date.now();
  const ONLINE_WINDOW = 180000; // 3 dakika

  await kv.zremrangebyscore('online_sessions', 0, now - ONLINE_WINDOW);
  const online = await kv.zcard('online_sessions');

  const sessionKeys = await kv.keys('sess:*');
  const totalSessions = sessionKeys.length;

  const pages = {};
  const devices = {};
  const countries = {};
  const referrers = {};
  const latest = [];

  const since24 = now - 24 * 3600 * 1000;

  for (const keySess of sessionKeys) {
    const sess = await kv.hgetall(keySess);
    if (!sess) continue;
    const lastSeen = Number(sess.last_seen || 0);
    const firstSeen = Number(sess.first_seen || lastSeen);

    const page = (sess.page || '/').toString();
    const device = (sess.device || 'Unknown').toString();
    const country = (sess.country || 'XX').toString();
    const ref = (sess.ref || '').toString();
    const ip = (sess.ip || '').toString();

    pages[page] = (pages[page] || 0) + 1;
    devices[device] = (devices[device] || 0) + 1;
    countries[country] = (countries[country] || 0) + 1;
    if (ref) referrers[ref] = (referrers[ref] || 0) + 1;

    if (lastSeen >= now - ONLINE_WINDOW) {
      latest.push({
        ip,
        country,
        device,
        page,
        ref,
        last_seen: lastSeen
      });
    }
  }

  latest.sort((a, b) => b.last_seen - a.last_seen);
  const latestLimited = latest.slice(0, 50);

  res.status(200).json({
    online,
    totalSessions,
    topPages: topN(pages),
    topDevices: topN(devices),
    topCountries: topN(countries),
    topReferrers: topN(referrers),
    latestSessions: latestLimited
  });
}
