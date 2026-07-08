const MAX_ENTRIES = 10;
const MAX_NAME_LENGTH = 12;
const LEADERBOARD_KEY = "global-top-10";
const LEADERBOARD_BACKUP_KEY = "global-top-10-backup";
const LEADERBOARD_LOG_KEY = "global-score-log";
const MAX_LOG_ENTRIES = 200;

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

function dedupeEntries(entries) {
  const seen = new Set();
  const deduped = [];
  for (const entry of entries.map(normalizeEntry)) {
    const key = `${entry.name}|${entry.score}|${entry.hero}|${entry.survivedSeconds}|${entry.createdAt}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped;
}

function sortEntries(entries) {
  return dedupeEntries(entries)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.survivedSeconds - a.survivedSeconds ||
        a.createdAt.localeCompare(b.createdAt),
    )
    .slice(0, MAX_ENTRIES);
}

async function readJsonArray(env, key) {
  const raw = await env.LEADERBOARD.get(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readEntries(env) {
  const [primary, backup, log] = await Promise.all([
    readJsonArray(env, LEADERBOARD_KEY),
    readJsonArray(env, LEADERBOARD_BACKUP_KEY),
    readJsonArray(env, LEADERBOARD_LOG_KEY),
  ]);
  return sortEntries([...primary, ...backup, ...log]);
}

async function writeEntries(env, entries, newEntry = null) {
  const next = sortEntries(entries);
  const currentLog = await readJsonArray(env, LEADERBOARD_LOG_KEY);
  const log = newEntry
    ? [newEntry, ...currentLog].slice(0, MAX_LOG_ENTRIES)
    : currentLog.slice(0, MAX_LOG_ENTRIES);

  await Promise.all([
    env.LEADERBOARD.put(LEADERBOARD_KEY, JSON.stringify(next)),
    env.LEADERBOARD.put(LEADERBOARD_BACKUP_KEY, JSON.stringify(next)),
    env.LEADERBOARD.put(LEADERBOARD_LOG_KEY, JSON.stringify(log)),
  ]);

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
      const newEntry = normalizeEntry({ ...body, createdAt: new Date().toISOString() });
      const next = await writeEntries(env, [...current, newEntry], newEntry);
      return json(request, 200, { entries: next });
    }

    return json(request, 405, { error: "method_not_allowed" });
  },
};
