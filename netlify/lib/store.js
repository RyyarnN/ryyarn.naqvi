import { getStore } from "@netlify/blobs";

export const entrantsStore = () => getStore({ name: "entrants", consistency: "strong" });

export async function listEntrants(store = entrantsStore()) {
  const { blobs } = await store.list();
  const entrants = await Promise.all(
    blobs.map(async ({ key }) => ({ key, data: await store.get(key, { type: "json" }) })),
  );
  return entrants.filter((e) => e.data);
}
