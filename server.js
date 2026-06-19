import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addLeaderboardEntry, readLeaderboard } from "./leaderboard-store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT || 8788);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
]);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

async function handleLeaderboard(req, res) {
  if (req.method === "GET") {
    sendJson(res, 200, { entries: await readLeaderboard() });
    return;
  }
  if (req.method === "POST") {
    const body = await readJsonBody(req);
    sendJson(res, 200, { entries: await addLeaderboardEntry(body) });
    return;
  }
  sendJson(res, 405, { error: "method_not_allowed" });
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);
  const safePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const target = path.normalize(path.join(DIST_DIR, safePath));
  const resolved = target.startsWith(DIST_DIR) ? target : path.join(DIST_DIR, "index.html");

  try {
    const data = await fs.readFile(resolved);
    res.writeHead(200, { "content-type": contentTypes.get(path.extname(resolved)) || "application/octet-stream" });
    res.end(data);
  } catch {
    const fallback = await fs.readFile(path.join(DIST_DIR, "index.html"));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(fallback);
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.url?.startsWith("/api/leaderboard")) {
      await handleLeaderboard(req, res);
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: "server_error", message: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Leaderboard server ready: http://localhost:${PORT}`);
});
