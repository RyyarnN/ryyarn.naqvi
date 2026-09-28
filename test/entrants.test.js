import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSignup, entrantKey, toPublic, rankEntrants } from "../netlify/lib/entrants.js";

const valid = {
  name: "Jane Player",
  email: "Jane@Example.com",
  platform: "playstation",
  gamertag: "Jane_Plays-99",
  streamUrl: "https://www.twitch.tv/janeplays",
  over18: true,
  acceptRules: true,
  publicProfile: true,
};

test("accepts a valid entry and normalizes email", () => {
  const { entrant, errors } = validateSignup(valid);
  assert.equal(errors, undefined);
  assert.equal(entrant.email, "jane@example.com");
  assert.equal(entrant.progress, null);
});

test("rejects missing consents and bad fields", () => {
  const { errors } = validateSignup({ ...valid, over18: false, acceptRules: "true", email: "nope" });
  assert.deepEqual(Object.keys(errors).sort(), ["acceptRules", "email", "over18"]);
});

test("validates gamertag per platform", () => {
  assert.ok(validateSignup({ ...valid, gamertag: "Jane Plays" }).errors.gamertag);
  assert.equal(validateSignup({ ...valid, platform: "xbox", gamertag: "Jane Plays" }).errors, undefined);
});

test("only allows https links to supported stream sites", () => {
  for (const url of ["http://twitch.tv/x", "https://evil.com/twitch.tv", "javascript:alert(1)", "https://nottwitch.tv/x"])
    assert.ok(validateSignup({ ...valid, streamUrl: url }).errors?.streamUrl, url);
  for (const url of ["https://youtube.com/@x", "https://m.youtube.com/@x", "https://kick.com/x"])
    assert.equal(validateSignup({ ...valid, streamUrl: url }).errors, undefined, url);
});

test("entrant keys are case- and whitespace-insensitive", () => {
  assert.equal(entrantKey("xbox", " Jane  Plays "), entrantKey("xbox", "jane plays"));
});

test("public view hides name and email", () => {
  const pub = toPublic(validateSignup(valid).entrant);
  assert.equal(pub.name, undefined);
  assert.equal(pub.email, undefined);
});

test("ranks by percent, then earliest to reach it, then signup time", () => {
  const e = (tag, percent, reachedAt, joinedAt = "2026-10-01") => ({
    gamertag: tag, joinedAt, progress: percent == null ? null : { percent, reachedAt },
  });
  const ranked = rankEntrants([
    e("none", null),
    e("slow", 80, "2026-11-25"),
    e("fast", 80, "2026-11-22"),
    e("top", 95, "2026-11-30"),
  ]);
  assert.deepEqual(ranked.map((r) => r.gamertag), ["top", "fast", "slow", "none"]);
});
