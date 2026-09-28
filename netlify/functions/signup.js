import { validateSignup, entrantKey } from "../lib/entrants.js";
import { entrantsStore } from "../lib/store.js";

const json = (body, status = 200) => Response.json(body, { status });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let input;
  try {
    input = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  // Honeypot: real users never see or fill this field.
  if (input.company) return json({ ok: true });

  const { entrant, errors } = validateSignup(input);
  if (errors) return json({ errors }, 422);

  const store = entrantsStore();
  const key = entrantKey(entrant.platform, entrant.gamertag);
  const { modified } = await store.setJSON(key, entrant, { onlyIfNew: true });
  if (!modified) {
    return json({ errors: { gamertag: "That gamertag is already entered." } }, 409);
  }

  return json({ ok: true }, 201);
};

export const config = { path: "/api/signup" };
