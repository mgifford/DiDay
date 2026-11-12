// The homepage shows the theme for the month of the next first Sunday.
// The selection is tested through the real date calculation, because the two
// have to agree: if they drift, the page announces the wrong month.
import { test } from "node:test";
import assert from "node:assert/strict";
import { upcomingFirstSundays } from "../lib/dates.js";
import { monthOf, themeForMonth, themeForDate, monthsWithoutTheme } from "../lib/themes.js";

const themes = [
  { id: "jan", month: 1 },
  { id: "dec", month: 12 },
];
const utc = (iso) => new Date(`${iso}T00:00:00Z`);
const nextTheme = (iso) => themeForDate(themes, upcomingFirstSundays(1, utc(iso))[0]);

test("reads the month in UTC", () => {
  assert.equal(monthOf(utc("2026-12-06")), 12);
  assert.equal(monthOf(utc("2026-01-03")), 1);
});

test("finds the theme for a month", () => {
  assert.equal(themeForMonth(themes, 12).id, "dec");
  assert.equal(themeForMonth(themes, 1).id, "jan");
});

test("returns null for a month with no theme", () => {
  assert.equal(themeForMonth(themes, 7), null);
});

test("December's theme is current on and before the December first Sunday", () => {
  assert.equal(nextTheme("2026-11-12").id, "dec");
  assert.equal(nextTheme("2026-12-01").id, "dec");
  assert.equal(nextTheme("2026-12-06").id, "dec");
});

test("January's theme takes over the day after December's first Sunday", () => {
  assert.equal(nextTheme("2026-12-07").id, "jan");
  assert.equal(nextTheme("2026-12-31").id, "jan");
});

test("the same month returns the same theme a year later", () => {
  assert.equal(nextTheme("2027-11-15").id, "dec");
  assert.equal(nextTheme("2027-12-05").id, "dec");
});

test("a month with no theme returns null rather than a neighbour", () => {
  // 2027-02-08: the next first Sunday is 7 March, which has no theme yet.
  assert.equal(nextTheme("2027-02-08"), null);
});

test("lists the months with no theme, in order", () => {
  const missing = monthsWithoutTheme(themes);
  assert.equal(missing.length, 10);
  assert.ok(!missing.includes(1), "January is defined");
  assert.ok(!missing.includes(12), "December is defined");
  assert.deepEqual(missing, [...missing].sort((a, b) => a - b));
});
