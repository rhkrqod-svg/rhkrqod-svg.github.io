const MAX_ENTRIES = 10;
const MAX_STORED_ENTRIES = 500;
const MAX_NAME_LENGTH = 12;
const MAX_SUBMISSION_ID_LENGTH = 80;
const LEADERBOARD_KEY = "global-top-10";
const LEADERBOARD_BACKUP_KEY = "global-top-10-backup";
const LEADERBOARD_LOG_KEY = "global-score-log";
const STORE_ENTRIES_KEY = "entries";
const STORE_INITIALIZED_KEY = "initialized";

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

function cleanSubmissionId(value) {
  const id = String(value ?? "")
    .trim()
    .slice(0, MAX_SUBMISSION_ID_LENGTH);
  return /^[a-zA-Z0-9._:-]{8,80}$/.test(id) ? id : "";
}

function normalizeEntry(entry) {
  const createdAt = typeof entry?.createdAt === "string" && entry.createdAt ? entry.createdAt : new Date().toISOString();
  return {
    id: typeof entry?.id === "string" && entry.id ? entry.id : "",
    name: cleanName(entry?.name),
    score: cleanScore(entry?.score),
    hero: cleanName(entry?.hero ?? ""),
    survivedSeconds: cleanScore(entry?.survivedSeconds),
    createdAt,
  };
}

function entryKey(entry) {
  if (entry.id) return `id:${entry.id}`;
  return `${entry.name}|${entry.score}|${entry.hero}|${entry.survivedSeconds}|${entry.createdAt}`;
}

function sortAllEntries(entries) {
  const seen = new Set();
  const deduped = [];
  for (const rawEntry of Array.isArray(entries) ? entries : []) {
    const entry = normalizeEntry(rawEntry);
    const key = entryKey(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.survivedSeconds - a.survivedSeconds ||
        a.createdAt.localeCompare(b.createdAt),
    )
    .slice(0, MAX_STORED_ENTRIES);
}

function topEntries(entries) {
  return sortAllEntries(entries).slice(0, MAX_ENTRIES);
}

function leaderboardPayload(entries, extra = {}) {
  const allEntries = sortAllEntries(entries);
  return {
    entries: allEntries.slice(0, MAX_ENTRIES),
    totalEntries: allEntries.length,
    ...extra,
  };
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

async function readLegacyEntries(env) {
  const [primary, backup, log] = await Promise.all([
    readJsonArray(env, LEADERBOARD_KEY),
    readJsonArray(env, LEADERBOARD_BACKUP_KEY),
    readJsonArray(env, LEADERBOARD_LOG_KEY),
  ]);
  return sortAllEntries([...primary, ...backup, ...log]);
}

async function writeLegacyBackup(env, entries) {
  const allEntries = sortAllEntries(entries);
  const top = allEntries.slice(0, MAX_ENTRIES);
  await Promise.all([
    env.LEADERBOARD.put(LEADERBOARD_KEY, JSON.stringify(top)),
    env.LEADERBOARD.put(LEADERBOARD_BACKUP_KEY, JSON.stringify(top)),
    env.LEADERBOARD.put(LEADERBOARD_LOG_KEY, JSON.stringify(allEntries.slice(0, 200))),
  ]);
}

export class LeaderboardStore {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.ready = state.blockConcurrencyWhile(async () => {
      const initialized = await state.storage.get(STORE_INITIALIZED_KEY);
      if (initialized) return;
      const legacyEntries = await readLegacyEntries(env);
      await state.storage.put({
        [STORE_ENTRIES_KEY]: legacyEntries,
        [STORE_INITIALIZED_KEY]: true,
      });
    });
  }

  async fetch(request) {
    await this.ready;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method === "GET") {
      const entries = (await this.state.storage.get(STORE_ENTRIES_KEY)) || [];
      const entryId = cleanSubmissionId(new URL(request.url).searchParams.get("entryId"));
      const foundEntry = entryId ? sortAllEntries(entries).find((entry) => entry.id === entryId) || null : null;
      return json(
        request,
        200,
        leaderboardPayload(entries, entryId ? { found: Boolean(foundEntry), entry: foundEntry } : {}),
      );
    }

    if (request.method === "POST") {
      let body = {};
      try {
        body = await request.json();
      } catch {
        return json(request, 400, { error: "invalid_json" });
      }

      if (cleanScore(body?.score) <= 0) {
        return json(request, 400, { error: "invalid_score" });
      }

      const submissionId = cleanSubmissionId(body?.submissionId) || crypto.randomUUID();
      const newEntry = normalizeEntry({
        ...body,
        id: submissionId,
        createdAt: new Date().toISOString(),
      });
      let next = [];
      let storedEntry = newEntry;
      await this.state.storage.transaction(async (transaction) => {
        const current = (await transaction.get(STORE_ENTRIES_KEY)) || [];
        const existing = sortAllEntries(current).find((entry) => entry.id === submissionId);
        storedEntry = existing || newEntry;
        next = existing ? sortAllEntries(current) : sortAllEntries([...current, newEntry]);
        await transaction.put(STORE_ENTRIES_KEY, next);
      });
      this.state.waitUntil(writeLegacyBackup(this.env, next).catch(() => undefined));
      const stored = next.some((entry) => entry.id === storedEntry.id);
      return json(request, 200, leaderboardPayload(next, { stored, entry: stored ? storedEntry : null }));
    }

    return json(request, 405, { error: "method_not_allowed" });
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return json(request, 200, { ok: true, service: "subway-villain-hunter-leaderboard", storage: "durable-object" });
    }

    if (url.pathname !== "/api/leaderboard") {
      return json(request, 404, { error: "not_found" });
    }

    const id = env.LEADERBOARD_STORE.idFromName("global");
    return env.LEADERBOARD_STORE.get(id).fetch(request);
  },
};
