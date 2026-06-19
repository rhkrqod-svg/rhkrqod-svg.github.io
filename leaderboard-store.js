import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");
const MAX_ENTRIES = 10;
const MAX_NAME_LENGTH = 12;

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

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(LEADERBOARD_FILE);
  } catch {
    await fs.writeFile(LEADERBOARD_FILE, "[]\n", "utf8");
  }
}

export async function readLeaderboard() {
  await ensureStore();
  const raw = await fs.readFile(LEADERBOARD_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return sortEntries(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export async function addLeaderboardEntry(entry) {
  const entries = await readLeaderboard();
  const next = sortEntries([...entries, normalizeEntry({ ...entry, createdAt: new Date().toISOString() })]);
  await fs.writeFile(LEADERBOARD_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}
