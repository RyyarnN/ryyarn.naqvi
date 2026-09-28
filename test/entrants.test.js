import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSignup, entrantKey, toPublic, rankEntrants, ageOn } from "../netlify/lib/entrants.js";

const valid = {
  name: "Jane Player",
  email: "Jane@Example.com",
  platform: "playstation",
  gamertag: "Jane_Plays-99",
  streamUrl: "https://www.twitch.tv/janeplays",
  dob: "1995-06-15",
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

test("requires a date of birth showing 18+", () => {
  const now = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const yearsAgo = (n, dayOffset = 0) =>
    iso(new Date(Date.UTC(now.getUTCFullYear() - n, now.getUTCMonth(), now.getUTCDate() + dayOffset)));

  assert.equal(validateSignup({ ...valid, dob: yearsAgo(18) }).errors, undefined, "18 today");
  assert.match(validateSignup({ ...valid, dob: yearsAgo(18, 1) }).errors.dob, /18 or older/, "18 tomorrow");
  for (const dob of ["", "2001-02-30", "15/06/1995", iso(new Date(Date.now() + 864e5)), "1850-01-01"])
    assert.ok(validateSignup({ ...valid, dob }).errors?.dob, dob);
});

test("ageOn counts whole years", () => {
  const now = new Date(Date.UTC(2026, 10, 19));
  assert.equal(ageOn("2008-11-19", now), 18);
  assert.equal(ageOn("2008-11-20", now), 17);
  assert.equal(ageOn("2008-02-29", now), 18);
});

test("public view hides date of birth", () => {
  assert.equal(toPublic(validateSignup(valid).entrant).dob, undefined);
});
