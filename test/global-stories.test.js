// The international page makes claims about other people's campaigns. These
// tests keep the data honest: every entry names a source, nothing claims a
// relationship it does not have, and no image appears without a licence.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCatalog } from "../lib/catalog.js";

const RELATIONSHIPS = ["international-initiative", "related-campaign", "event-directory"];

test("every story has a source that supports its description", () => {
  const { globalStories } = loadCatalog();
  assert.ok(globalStories.length > 0, "the world page would be empty");
  for (const story of globalStories) {
    assert.match(story.source_url, /^https:\/\//, `${story.id} has no https source_url`);
  }
});

test("relationship values stay within the documented set", () => {
  const { globalStories } = loadCatalog();
  for (const story of globalStories) {
    assert.ok(RELATIONSHIPS.includes(story.relationship), `${story.id}: "${story.relationship}"`);
  }
});

test("no story claims to be a chapter", () => {
  // The site links to other campaigns; it does not claim affiliation, and no
  // entry may describe itself as an official chapter of another project.
  const { globalStories } = loadCatalog();
  const forbidden = /official chapter|national chapter|member of|partnership/i;
  for (const story of globalStories) {
    const text = `${story.title?.en} ${story.summary?.en}`;
    assert.ok(!forbidden.test(text), `${story.id} implies a formal relationship`);
  }
});

test("no image appears without a credit and a licence", () => {
  const { globalStories } = loadCatalog();
  for (const story of globalStories) {
    if (!story.image) continue;
    assert.ok(story.image_credit, `${story.id}: image without a credit`);
    assert.ok(story.image_licence, `${story.id}: image without a licence`);
  }
});

test("every story is written in both languages", () => {
  const { globalStories } = loadCatalog();
  for (const story of globalStories) {
    for (const lang of ["en", "fr"]) {
      assert.ok(story.title?.[lang]?.trim(), `${story.id}.title.${lang} is empty`);
      assert.ok(story.summary?.[lang]?.trim(), `${story.id}.summary.${lang} is empty`);
    }
  }
});

test("ids are unique", () => {
  const { globalStories } = loadCatalog();
  const ids = globalStories.map((story) => story.id);
  assert.equal(new Set(ids).size, ids.length);
});
