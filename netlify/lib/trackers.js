// Fetches a player's GTA VI trophy/achievement progress from each platform.
// Both sources are unofficial or third-party, so every call can fail. Callers should
// keep the last known progress when a fetch throws.
//
// Required environment variables:
//   OPENXBL_API_KEY       - key from https://xbl.io (Xbox)
//   PSN_NPSSO             - NPSSO token from a PlayStation account used only for lookups
//   GTA6_XBOX_TITLE_ID    - GTA VI's Xbox title ID (known once the game is listed)
//   GTA6_PSN_NP_COMM_ID   - GTA VI's trophy list ID, e.g. NPWR12345_00 (known at launch)

import {
  exchangeNpssoForAccessCode,
  exchangeAccessCodeForAuthTokens,
  makeUniversalSearch,
  getUserTitles,
} from "psn-api";

const XBL_BASE = "https://xbl.io/api/v2";

async function xbl(path) {
  const res = await fetch(`${XBL_BASE}${path}`, {
    headers: { "X-Authorization": process.env.OPENXBL_API_KEY, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`OpenXBL ${path} -> ${res.status}`);
  return res.json();
}

export async function xboxProgress(entrant) {
  const titleId = process.env.GTA6_XBOX_TITLE_ID;
  if (!titleId || !process.env.OPENXBL_API_KEY) return null;

  let xuid = entrant.platformId;
  if (!xuid) {
    const search = await xbl(`/search/${encodeURIComponent(entrant.gamertag)}`);
    const match = search.people?.find(
      (p) => p.gamertag?.toLowerCase() === entrant.gamertag.toLowerCase(),
    );
    if (!match) throw new Error(`Xbox gamertag not found: ${entrant.gamertag}`);
    xuid = match.xuid;
  }

  const history = await xbl(`/achievements/player/${xuid}`);
  const title = history.titles?.find((t) => String(t.titleId) === String(titleId));
  const a = title?.achievement;
  const earned = a?.currentAchievements ?? 0;
  const total = a?.totalAchievements ?? 0;
  return {
    platformId: xuid,
    earned,
    total,
    percent: a?.progressPercentage ?? (total ? Math.round((earned / total) * 100) : 0),
  };
}

let psnAuth = null;

async function psnAuthorization() {
  if (psnAuth && psnAuth.expiresAt > Date.now() + 60_000) return psnAuth;
  const code = await exchangeNpssoForAccessCode(process.env.PSN_NPSSO);
  const tokens = await exchangeAccessCodeForAuthTokens(code);
  psnAuth = { ...tokens, expiresAt: Date.now() + tokens.expiresIn * 1000 };
  return psnAuth;
}

export async function playstationProgress(entrant) {
  const npCommId = process.env.GTA6_PSN_NP_COMM_ID;
  if (!npCommId || !process.env.PSN_NPSSO) return null;

  const auth = await psnAuthorization();
  let accountId = entrant.platformId;
  if (!accountId) {
    const search = await makeUniversalSearch(auth, entrant.gamertag, "SocialAllAccounts");
    const match = search.domainResponses?.[0]?.results?.find(
      (r) => r.socialMetadata?.onlineId?.toLowerCase() === entrant.gamertag.toLowerCase(),
    );
    if (!match) throw new Error(`PSN ID not found: ${entrant.gamertag}`);
    accountId = match.socialMetadata.accountId;
  }

  // Fails with a 403-style error when the player's trophies are private.
  const { trophyTitles = [] } = await getUserTitles(auth, accountId, { limit: 800 });
  const title = trophyTitles.find((t) => t.npCommunicationId === npCommId);
  const count = (o) => Object.values(o ?? {}).reduce((sum, n) => sum + n, 0);
  return {
    platformId: accountId,
    earned: count(title?.earnedTrophies),
    total: count(title?.definedTrophies),
    percent: title?.progress ?? 0,
  };
}

export const trackers = { xbox: xboxProgress, playstation: playstationProgress };
