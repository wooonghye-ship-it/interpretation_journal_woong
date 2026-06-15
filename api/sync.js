module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "POST only" });
    return;
  }

  try {
    const payload = await readJsonBody(request);
    const endpoint = String(payload.endpoint || "").trim();
    const record = payload.record || {};

    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/i.test(endpoint)) {
      response.status(400).json({ ok: false, error: "Invalid Apps Script URL" });
      return;
    }
    if (!record.id) {
      response.status(400).json({ ok: false, error: "record.id is required" });
      return;
    }

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "upsert", record })
    });

    const text = await upstream.text();
    const result = parseJson(text);
    if (!upstream.ok || result.ok === false) {
      response.status(502).json({
        ok: false,
        error: result.error || `Apps Script returned ${upstream.status}`
      });
      return;
    }

    response.status(200).json({ ok: true, result });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Sync failed"
    });
  }
};

async function readJsonBody(request) {
  if (request.body) {
    return typeof request.body === "string" ? parseJson(request.body) : request.body;
  }

  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? parseJson(raw) : {};
}

function parseJson(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}
