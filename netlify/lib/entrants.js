// Validation and storage helpers shared by the signup, leaderboard and sync functions.

export const PLATFORMS = ["playstation", "xbox"];

const STREAM_HOSTS = ["twitch.tv", "youtube.com", "youtu.be", "kick.com"];

// PSN Online IDs: 3-16 chars, letters/digits/-/_. Xbox gamertags: up to 15 chars, may include spaces.
const GAMERTAG_RULES = {
  playstation: /^[A-Za-z][A-Za-z0-9_-]{2,15}$/,
  xbox: /^[A-Za-z0-9 ]{1,15}$/,
};

export function entrantKey(platform, gamertag) {
  return `${platform}:${gamertag.trim().toLowerCase().replace(/\s+/g, "_")}`;
}

function isStreamUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.replace(/^www\./, "");
    return STREAM_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

// Returns { entrant } on success or { errors } (field -> message) on failure.
export function validateSignup(input) {
  const errors = {};
  const str = (k) => (typeof input[k] === "string" ? input[k].trim() : "");

  const name = str("name");
  const email = str("email").toLowerCase();
  const platform = str("platform").toLowerCase();
  const gamertag = str("gamertag");
  const streamUrl = str("streamUrl");

  if (name.length < 2 || name.length > 80) errors.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    errors.email = "Enter a valid email address.";
  if (!PLATFORMS.includes(platform)) errors.platform = "Choose PlayStation or Xbox.";
  else if (!GAMERTAG_RULES[platform].test(gamertag))
    errors.gamertag =
      platform === "playstation"
        ? "PSN IDs are 3–16 characters: letters, numbers, - or _."
        : "Xbox gamertags are up to 15 letters, numbers or spaces.";
  if (!isStreamUrl(streamUrl))
    errors.streamUrl = "Link your Twitch, YouTube or Kick channel (https://…).";
  if (input.over18 !== true) errors.over18 = "You must be 18 or older to enter.";
  if (input.acceptRules !== true) errors.acceptRules = "You must accept the official rules.";
  if (input.publicProfile !== true)
    errors.publicProfile = "Your trophies/achievements must be public so we can track progress.";

  if (Object.keys(errors).length) return { errors };

  return {
    entrant: {
      name,
      email,
      platform,
      gamertag,
      streamUrl,
      createdAt: new Date().toISOString(),
      progress: null, // filled in by sync-progress
    },
  };
}

// Only these fields are ever exposed publicly. Name and email stay private.
export function toPublic(entrant) {
  return {
    gamertag: entrant.gamertag,
    platform: entrant.platform,
    streamUrl: entrant.streamUrl,
    progress: entrant.progress,
    joinedAt: entrant.createdAt,
  };
}

// Highest progress first; ties go to whoever reached it earliest, then earliest signup.
export function rankEntrants(entrants) {
  const pct = (e) => e.progress?.percent ?? -1;
  return [...entrants].sort(
    (a, b) =>
      pct(b) - pct(a) ||
      (a.progress?.reachedAt ?? "").localeCompare(b.progress?.reachedAt ?? "") ||
      a.joinedAt.localeCompare(b.joinedAt),
  );
}
