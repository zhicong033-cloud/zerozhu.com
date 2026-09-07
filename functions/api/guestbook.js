function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function clean(s, max) {
  return String(s || "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

async function listMessages(kv) {
  const raw = await kv.get("messages");
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return json({}, 204);
  if (!env.GUESTBOOK) return json({ error: "GUESTBOOK binding missing" }, 500);

  if (request.method === "GET") {
    const messages = await listMessages(env.GUESTBOOK);
    return json({ messages });
  }

  if (request.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const name = clean(body.name, 40) || "访客";
  const message = clean(body.message, 800);
  const contact = clean(body.contact, 80);
  if (!message || message.length < 2) return json({ error: "留言太短了" }, 400);

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    message,
    contact: contact || "",
    createdAt: new Date().toISOString(),
  };

  const messages = await listMessages(env.GUESTBOOK);
  messages.unshift(entry);
  // keep latest 200
  const trimmed = messages.slice(0, 200);
  await env.GUESTBOOK.put("messages", JSON.stringify(trimmed));
  return json({ ok: true, entry, messages: trimmed });
}
