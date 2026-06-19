const MAX_ENTRIES = 10;
const MAX_NAME_LENGTH = 12;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("access-control-allow-origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
  res.end(JSON.stringify(payload));
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

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function getGithubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "rhkrqod-svg";
  const repo = process.env.GITHUB_REPO || "rhkrqod-svg.github.io";
  const branch = process.env.GITHUB_BRANCH || "source";
  const filePath = process.env.LEADERBOARD_FILE || "data/leaderboard.json";
  if (!token) throw new Error("missing_github_token");
  return { token, owner, repo, branch, filePath };
}

async function githubRequest(path, options = {}) {
  const { token } = getGithubConfig();
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`github_${response.status}_${text.slice(0, 120)}`);
  }
  return response.json();
}

async function readLeaderboardFile() {
  const { owner, repo, branch, filePath } = getGithubConfig();
  try {
    const data = await githubRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`);
    const raw = Buffer.from(data.content || "", "base64").toString("utf8");
    const parsed = JSON.parse(raw);
    return { entries: sortEntries(Array.isArray(parsed) ? parsed : []), sha: data.sha };
  } catch (error) {
    if (String(error.message || "").includes("github_404_")) return { entries: [], sha: null };
    throw error;
  }
}

async function writeLeaderboardFile(entries, sha) {
  const { owner, repo, branch, filePath } = getGithubConfig();
  const body = {
    message: "Update leaderboard",
    branch,
    content: Buffer.from(`${JSON.stringify(sortEntries(entries), null, 2)}\n`, "utf8").toString("base64"),
  };
  if (sha) body.sha = sha;
  await githubRequest(`/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (req.method === "GET") {
      const { entries } = await readLeaderboardFile();
      sendJson(res, 200, { entries });
      return;
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const current = await readLeaderboardFile();
      const next = sortEntries([...current.entries, normalizeEntry({ ...body, createdAt: new Date().toISOString() })]);
      await writeLeaderboardFile(next, current.sha);
      sendJson(res, 200, { entries: next });
      return;
    }

    sendJson(res, 405, { error: "method_not_allowed" });
  } catch (error) {
    sendJson(res, 500, { error: "server_error", message: error instanceof Error ? error.message : String(error) });
  }
}
