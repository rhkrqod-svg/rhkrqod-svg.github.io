const MAX_ENTRIES = 10;
const MAX_NAME_LENGTH = 12;
const LEADERBOARD_KEY = "global-top-10";

function corsHeaders(request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
  };
}

function json(request, status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(request),
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function cleanName(value) {
  const name = String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, MAX_NAME_LENGTH);
  return name || "이름없음";
}

function cleanScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.round(score));
}

function normalizeEntry(entry) {
  return {
    name: cleanName(entry.name),
    score: cleanScore(entry.score),
    hero: cleanName(entry.hero ?? ""),
    survivedSeconds: cleanScore(entry.survivedSeconds),
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function sortEntries(entries) {
  return entries
    .map(normalizeEntry)
    .sort((a, b) => b.score - a.score || b.survivedSeconds - a.survivedSeconds || a.createdAt.localeCompare(b.createdAt))
    .slice(0, MAX_ENTRIES);
}

async function readEntries(env) {
  const raw = await env.LEADERBOARD.get(LEADERBOARD_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return sortEntries(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

async function writeEntries(env, entries) {
  const next = sortEntries(entries);
  await env.LEADERBOARD.put(LEADERBOARD_KEY, JSON.stringify(next));
  return next;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return json(request, 200, { ok: true, service: "subway-villain-hunter-leaderboard" });
    }

    if (url.pathname !== "/api/leaderboard") {
      return json(request, 404, { error: "not_found" });
    }

    if (request.method === "GET") {
      return json(request, 200, { entries: await readEntries(env) });
    }

    if (request.method === "POST") {
      let body = {};
      try {
        body = await request.json();
      } catch {
        return json(request, 400, { error: "invalid_json" });
      }
      const current = await readEntries(env);
      const next = await writeEntries(env, [...current, normalizeEntry({ ...body, createdAt: new Date().toISOString() })]);
      return json(request, 200, { entries: next });
    }

    return json(request, 405, { error: "method_not_allowed" });
  },
};
