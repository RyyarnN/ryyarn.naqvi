// Scheduled every 10 minutes: refreshes each entrant's trophy/achievement progress.
import { listEntrants, entrantsStore } from "../lib/store.js";
import { trackers } from "../lib/trackers.js";

export default async () => {
  const store = entrantsStore();
  const entrants = await listEntrants(store);
  let updated = 0;
  let failed = 0;

  // Sequential on purpose: both APIs rate-limit aggressively.
  for (const { key, data } of entrants) {
    try {
      const result = await trackers[data.platform]?.(data);
      if (!result) continue; // game IDs or API keys not configured yet

      const { platformId, ...progress } = result;
      const improved = progress.percent > (data.progress?.percent ?? -1);
      await store.setJSON(key, {
        ...data,
        platformId,
        syncError: null,
        progress: {
          ...progress,
          checkedAt: new Date().toISOString(),
          reachedAt: improved ? new Date().toISOString() : data.progress?.reachedAt,
        },
      });
      updated++;
    } catch (err) {
      failed++;
      console.error(`sync failed for ${key}:`, err.message);
      await store.setJSON(key, { ...data, syncError: err.message });
    }
  }

  console.log(`sync-progress: ${updated} updated, ${failed} failed, ${entrants.length} total`);
};

export const config = { schedule: "*/10 * * * *" };
