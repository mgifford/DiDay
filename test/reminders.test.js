import { test } from "node:test";
import assert from "node:assert/strict";
import { isFirstSunday, reminderPosts, pickVariant, postedToday, expiredReminders } from "../lib/reminders.js";

const d = (s) => new Date(s);
const catalog = (url) => ({
  site: { url, languages: ["en", "fr"] },
  strings: { reminder_post: { en: ["Go {url}/en/recipes/"], fr: ["Allez {url}/fr/recipes/"] } },
});

test("knows the first Sunday", () => {
  assert.equal(isFirstSunday(d("2026-10-04T13:00:00Z")), true);
  assert.equal(isFirstSunday(d("2026-10-11T13:00:00Z")), false);
  assert.equal(isFirstSunday(d("2026-10-01T13:00:00Z")), false);
  assert.equal(isFirstSunday(d("2026-11-01T13:00:00Z")), true);
});

test("writes one post per language, and none without a site url", () => {
  assert.deepEqual(reminderPosts(catalog("https://example.ca/"), d("2026-10-04T13:00:00Z")), [
    { language: "en", status: "Go https://example.ca/en/recipes/" },
    { language: "fr", status: "Allez https://example.ca/fr/recipes/" },
  ]);
  assert.deepEqual(reminderPosts(catalog(null)), []);
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
