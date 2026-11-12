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

// The data side: the year must be complete, because the homepage and the
// themes index both assume twelve entries.
import { loadCatalog } from "../lib/catalog.js";

test("every month of the year has exactly one theme", () => {
  const { themes } = loadCatalog();
  assert.equal(themes.length, 12, "expected twelve themes");
  const months = themes.map((theme) => theme.month).sort((a, b) => a - b);
  assert.deepEqual(months, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test("theme ids are unique and usable as URL slugs", () => {
  const { themes } = loadCatalog();
  const ids = themes.map((theme) => theme.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate theme id");
  for (const id of ids) {
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `id "${id}" is not a slug`);
  }
});

test("every theme reference points at an entry that exists", () => {
  const { themes, recipes, alternatives } = loadCatalog();
  const recipeIds = new Set(recipes.map((recipe) => recipe.id));
  const alternativeIds = new Set(alternatives.map((a) => a.id));
  for (const theme of themes) {
    for (const id of theme.recipes) {
      assert.ok(recipeIds.has(id), `${theme.id}: unknown recipe "${id}"`);
    }
    for (const id of theme.alternatives) {
      assert.ok(alternativeIds.has(id), `${theme.id}: unknown alternative "${id}"`);
    }
  }
});

test("each theme is titled, summarised and given an action in both languages", () => {
  const { themes } = loadCatalog();
  for (const theme of themes) {
    for (const field of ["title", "summary", "action"]) {
      for (const lang of ["en", "fr"]) {
        assert.ok(theme[field]?.[lang]?.trim(), `${theme.id}.${field}.${lang} is empty`);
      }
    }
  }
});
