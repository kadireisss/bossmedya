import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const now = Date.now();
  const ua = req.headers["user-agent"] || "unknown";
  const ip =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "0.0.0.0";

  const page = req.query.page || "/";
  const ref = req.query.ref || "";
  const country = req.headers["cf-ipcountry"] || "XX";
  const device = /mobile|android|iphone/i.test(ua) ? "Mobile" : "Desktop";

  const id = Buffer.from(ip + ua).toString("base64").slice(0, 32);

  const KV_URL = process.env.KV_REST_API_URL;
  const TOKEN = process.env.KV_REST_API_TOKEN;

  await fetch(`${KV_URL}/set/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ip, ua, page, ref, country, device, last_seen: now })
  });

  await fetch(`${KV_URL}/zadd/online`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ score: now, member: id })
  });

  res.json({ ok: true });
}
