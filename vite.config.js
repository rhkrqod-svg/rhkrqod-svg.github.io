import { defineConfig } from "vite";
import { addLeaderboardEntry, readLeaderboard } from "./leaderboard-store.js";

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(payload));
}

function leaderboardApiPlugin() {
  return {
    name: "leaderboard-api",
    configureServer(server) {
      server.middlewares.use("/api/leaderboard", async (req, res) => {
        try {
          if (req.method === "GET") {
            sendJson(res, 200, { entries: await readLeaderboard() });
            return;
          }
          if (req.method === "POST") {
            sendJson(res, 200, { entries: await addLeaderboardEntry(await readJsonBody(req)) });
            return;
          }
          sendJson(res, 405, { error: "method_not_allowed" });
        } catch (error) {
          sendJson(res, 500, { error: "server_error", message: error instanceof Error ? error.message : String(error) });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [leaderboardApiPlugin()],
  server: {
    host: "0.0.0.0",
    allowedHosts: [".trycloudflare.com", ".loca.lt", "192.168.219.102"],
  },
});
