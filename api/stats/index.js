import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "forbidden" });
  }

  const KV_URL = process.env.KV_REST_API_URL;
  const TOKEN = process.env.KV_REST_API_TOKEN;
  const now = Date.now();
  const LIMIT = 180000;

  await fetch(`${KV_URL}/zremrangebyscore/online/0/${now - LIMIT}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const onlineRes = await fetch(`${KV_URL}/zrange/online/0/-1`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const ids = await onlineRes.json();
  let users = [];

  for (const id of ids) {
    const info = await fetch(`${KV_URL}/get/${id}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const data = await info.json();
    if (data) users.push(data);
  }

  res.json({ online: users.length, users });
}
