import { toPublic, rankEntrants } from "../lib/entrants.js";
import { listEntrants } from "../lib/store.js";
import { CORS_HEADERS, preflight } from "../lib/cors.js";

export default async (req) => {
  if (req.method === "OPTIONS") return preflight();
  const entrants = await listEntrants();
  const ranked = rankEntrants(entrants.map((e) => toPublic(e.data)));
  return Response.json(
    { updatedAt: new Date().toISOString(), count: ranked.length, entrants: ranked },
    { headers: { ...CORS_HEADERS, "Cache-Control": "public, max-age=60" } },
  );
};

export const config = { path: "/api/leaderboard" };
