function shanghaiDayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

async function readCount(kv, key) {
  const v = await kv.get(key);
  const n = Number(v || 0);
  return Number.isFinite(n) ? n : 0;
}

async function bump(kv, key, by = 1) {
  const next = (await readCount(kv, key)) + by;
  await kv.put(key, String(next));
  return next;
}

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "*";
  if (request.method === "OPTIONS") {
    return json({}, 204, origin);
  }
  if (!env.STATS) return json({ error: "STATS binding missing" }, 500, origin);

  const url = new URL(request.url);
  const day = shanghaiDayKey();
  const action = url.searchParams.get("action") || "hit";

  let todayViews = await readCount(env.STATS, `day:${day}:views`);
  let totalViews = await readCount(env.STATS, "total:views");
  let todayClicks = await readCount(env.STATS, `day:${day}:clicks`);
  let totalClicks = await readCount(env.STATS, "total:clicks");

  if (request.method === "POST" || (request.method === "GET" && action !== "read")) {
    if (action === "click") {
      todayClicks = await bump(env.STATS, `day:${day}:clicks`);
      totalClicks = await bump(env.STATS, "total:clicks");
    } else if (action === "hit") {
      todayViews = await bump(env.STATS, `day:${day}:views`);
      totalViews = await bump(env.STATS, "total:views");
    }
  }

  return json({ day, todayViews, totalViews, todayClicks, totalClicks }, 200, origin);
}
