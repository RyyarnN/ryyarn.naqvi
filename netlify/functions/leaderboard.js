import { toPublic, rankEntrants } from "../lib/entrants.js";
import { listEntrants } from "../lib/store.js";

export default async () => {
  const entrants = await listEntrants();
  const ranked = rankEntrants(entrants.map((e) => toPublic(e.data)));
  return Response.json(
    { updatedAt: new Date().toISOString(), count: ranked.length, entrants: ranked },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
};

export const config = { path: "/api/leaderboard" };
