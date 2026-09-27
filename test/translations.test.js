import { test } from "node:test";
import assert from "node:assert/strict";
import { collectPairs, fingerprint, status } from "../lib/translations.js";

const catalog = {
  site: { name: { en: "First Sunday", fr: "Premier dimanche" } },
  strings: { skip: { en: "Skip", fr: "Passer" }, countries: { CA: { en: "Canada", fr: "Canada" } } },
  categories: [],
  alternatives: [{ id: "kobo", name: "Kobo", notes: { en: "Reads EPUB.", fr: "Lit l'EPUB." } }],
  recipes: [{ id: "r", title: { en: "T", fr: "T" }, steps: { en: ["a", "b"], fr: ["a", "b"] } }],
};

test("finds every bilingual field by location", () => {
  const keys = collectPairs(catalog).map((p) => p.key);
  assert.deepEqual(keys.sort(), [
    "alternatives.kobo.notes", "recipes.r.steps", "recipes.r.title",
    "site.name", "strings.countries.CA", "strings.skip",
  ]);
});

test("reports each kind of change", () => {
  const pair = { key: "k", en: "Hello", fr: "Bonjour" };
  const approved = { k: { en: fingerprint("Hello"), fr: fingerprint("Bonjour") } };
  assert.equal(status(pair, {}), "never-reviewed");
  assert.equal(status(pair, approved), "ok");
  assert.equal(status({ ...pair, en: "Hello there" }, approved), "english-changed");
  assert.equal(status({ ...pair, fr: "Salut" }, approved), "french-changed");
  assert.equal(status({ key: "k", en: "Hi", fr: "Salut" }, approved), "both-changed");
});

test("a change to one recipe step marks the steps as changed", () => {
  const steps = { en: ["a", "b"], fr: ["a", "b"] };
  const approved = { s: { en: fingerprint(steps.en), fr: fingerprint(steps.fr) } };
  assert.equal(status({ key: "s", en: ["a", "c"], fr: steps.fr }, approved), "english-changed");
});
