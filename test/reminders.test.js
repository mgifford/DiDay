import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isFirstSunday, isTeaserDay, isFollowupDay, occasionFor,
  postsForOccasion, pickVariant, postedToday, expiredReminders,
} from "../lib/reminders.js";

const d = (s) => new Date(s);
const catalog = (url) => ({
  site: { url, languages: ["en", "fr"] },
  strings: {
    teaser_post: { en: ["Soon {url}/en/recipes/"], fr: ["Bientôt {url}/fr/recipes/"] },
    reminder_post: { en: ["Go {url}/en/recipes/"], fr: ["Allez {url}/fr/recipes/"] },
    followup_post: { en: ["How did it go {url}/en/recipes/"], fr: ["Et alors {url}/fr/recipes/"] },
  },
});

test("knows the first Sunday", () => {
  assert.equal(isFirstSunday(d("2026-10-04T13:00:00Z")), true);
  assert.equal(isFirstSunday(d("2026-10-11T13:00:00Z")), false);
  assert.equal(isFirstSunday(d("2026-10-01T13:00:00Z")), false);
  assert.equal(isFirstSunday(d("2026-11-01T13:00:00Z")), true);
});

test("knows the Friday before and Monday after a first Sunday", () => {
  // October 2026: first Sunday is the 4th.
  assert.equal(isTeaserDay(d("2026-10-02T13:00:00Z")), true);
  assert.equal(isTeaserDay(d("2026-10-04T13:00:00Z")), false);
  assert.equal(isFollowupDay(d("2026-10-05T13:00:00Z")), true);
  assert.equal(isFollowupDay(d("2026-10-04T13:00:00Z")), false);
});

test("handles a first Sunday that falls on the 1st-3rd, crossing months", () => {
  // November 2026: first Sunday is the 1st, so the teaser Friday is in October.
  assert.equal(isFirstSunday(d("2026-11-01T13:00:00Z")), true);
  assert.equal(isTeaserDay(d("2026-10-30T13:00:00Z")), true);
  assert.equal(isFollowupDay(d("2026-11-02T13:00:00Z")), true);
});

test("picks exactly one occasion per day, or none", () => {
  assert.equal(occasionFor(d("2026-10-02T13:00:00Z")), "teaser");
  assert.equal(occasionFor(d("2026-10-04T13:00:00Z")), "reminder");
  assert.equal(occasionFor(d("2026-10-05T13:00:00Z")), "followup");
  assert.equal(occasionFor(d("2026-10-06T13:00:00Z")), null);
});

test("writes one post per language, for the given occasion, and none without a site url", () => {
  assert.deepEqual(postsForOccasion("reminder", catalog("https://example.ca/"), d("2026-10-04T13:00:00Z")), [
    { language: "en", status: "Go https://example.ca/en/recipes/" },
    { language: "fr", status: "Allez https://example.ca/fr/recipes/" },
  ]);
  assert.deepEqual(postsForOccasion("teaser", catalog("https://example.ca/"), d("2026-10-02T13:00:00Z")), [
    { language: "en", status: "Soon https://example.ca/en/recipes/" },
    { language: "fr", status: "Bientôt https://example.ca/fr/recipes/" },
  ]);
  assert.deepEqual(postsForOccasion("reminder", catalog(null), d("2026-10-04T13:00:00Z")), []);
  assert.deepEqual(postsForOccasion(null, catalog("https://example.ca/"), d("2026-10-06T13:00:00Z")), []);
});

test("picks a variant deterministically by month, wrapping around the list", () => {
  const variants = ["a", "b", "c"];
  assert.equal(pickVariant(variants, d("2026-01-01T00:00:00Z")), variants[(2026 * 12 + 0) % 3]);
  // Same month, different day: same variant.
  assert.equal(pickVariant(variants, d("2026-01-15T00:00:00Z")), pickVariant(variants, d("2026-01-01T00:00:00Z")));
  // Different month: not guaranteed different, but the index must follow the formula.
  assert.equal(pickVariant(variants, d("2026-02-01T00:00:00Z")), variants[(2026 * 12 + 1) % 3]);
});

const now = d("2026-11-10T13:00:00Z");
const statuses = [
  { id: "1", created_at: "2026-10-04T13:00:00Z", application: { name: "DI.DAY Canada reminders" } },
  { id: "2", created_at: "2026-10-04T13:00:00Z", application: { name: "Mastodon for iOS" } },
  { id: "3", created_at: "2026-10-04T13:00:00Z", application: { name: "DI.DAY Canada reminders" }, pinned: true },
  { id: "4", created_at: "2026-11-01T13:00:00Z", application: { name: "DI.DAY Canada reminders" } },
];

test("deletes only this app's unpinned reminders older than 30 days", () => {
  assert.deepEqual(expiredReminders(statuses, "DI.DAY Canada reminders", now).map((s) => s.id), ["1"]);
});

test("does not post twice on the same day", () => {
  assert.equal(postedToday(statuses, "DI.DAY Canada reminders", d("2026-11-01T20:00:00Z")), true);
  assert.equal(postedToday(statuses, "DI.DAY Canada reminders", d("2026-11-02T13:00:00Z")), false);
});
