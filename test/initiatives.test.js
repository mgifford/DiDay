// The ecosystem directory's rules, tested before there is a directory.
// PR 2 adds data/initiatives.yaml and calls the same validator from
// scripts/validate.js, so these rules decide what can be published.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateInitiative, validateInitiatives } from "../lib/initiatives.js";

// A record that should pass. Each test breaks one thing.
const valid = () => ({
  id: "example-org",
  name: "Example Organization",
  website: "https://example.org/",
  country: "CA",
  organization_type: "non-profit",
  categories: ["digital-rights"],
  summary: { en: "One sentence.", fr: "Une phrase." },
  canadian_connection: { type: "headquartered", evidence: "https://example.org/about" },
  contributions: [
    {
      project: null,
      type: "public-infrastructure",
      description: { en: "What it did.", fr: "Ce qu'elle a fait." },
      sources: ["https://example.org/report"],
    },
  ],
  relationships: { alternatives: [], campaigns: [], themes: [] },
  sources: [{ url: "https://example.org/about", supports: ["organization_type"] }],
  status: "listed",
  featured: false,
  verified: false,
  last_reviewed: null,
});

const fails = (record, pattern) => {
  const errors = validateInitiative(record);
  assert.ok(errors.length > 0, "expected at least one error");
  if (pattern) {
    assert.ok(
      errors.some((error) => pattern.test(error)),
      `expected an error matching ${pattern}, got:\n${errors.join("\n")}`
    );
  }
  return errors;
};

test("a complete record passes", () => {
  assert.deepEqual(validateInitiative(valid()), []);
});

test("rejects a summary missing French", () => {
  const record = valid();
  record.summary = { en: "One sentence." };
  fails(record, /summary needs English and French/);
});

test("rejects an unknown category", () => {
  const record = valid();
  record.categories = ["thought-leadership"];
  fails(record, /unknown category "thought-leadership"/);
});

test("rejects a duplicate id across records", () => {
  const errors = validateInitiatives([valid(), valid()]);
  assert.ok(errors.some((error) => /duplicate id/.test(error)));
});

test("rejects a relationship to a theme that does not exist", () => {
  const record = valid();
  record.relationships.themes = ["no-such-theme"];
  const errors = validateInitiative(record, { themesIds: new Set(["protect-your-privacy"]) });
  assert.ok(errors.some((error) => /does not exist/.test(error)));
});

test("accepts a relationship to a theme that exists", () => {
  const record = valid();
  record.relationships.themes = ["protect-your-privacy"];
  assert.deepEqual(validateInitiative(record, { themesIds: new Set(["protect-your-privacy"]) }), []);
});

test("rejects a contribution with no source", () => {
  const record = valid();
  record.contributions[0].sources = [];
  fails(record, /needs at least one source/);
});

test("rejects a source with no supports list", () => {
  const record = valid();
  record.sources = [{ url: "https://example.org/about" }];
  fails(record, /needs a "supports" list/);
});

test("rejects a claim sourced over http", () => {
  const record = valid();
  record.sources = [{ url: "http://example.org/about", supports: ["organization_type"] }];
  fails(record, /must be an https URL/);
});

test("rejects featured status without a rationale", () => {
  const record = valid();
  record.status = "documented-contributor";
  record.featured = true;
  fails(record, /featured_rationale/);
});

test("rejects featured status on a merely listed organization", () => {
  const record = valid();
  record.status = "listed";
  record.featured = true;
  record.featured_rationale = { en: "Because.", fr: "Parce que." };
  fails(record, /documented-contributor/);
});

test("rejects a rationale left behind after unfeaturing", () => {
  const record = valid();
  record.featured = false;
  record.featured_rationale = { en: "Because.", fr: "Parce que." };
  fails(record, /featured_rationale is set but featured is not true/);
});

test("accepts a featured documented contributor with a rationale", () => {
  const record = valid();
  record.status = "documented-contributor";
  record.featured = true;
  record.featured_rationale = { en: "Built a thing.", fr: "A construit une chose." };
  assert.deepEqual(validateInitiative(record), []);
});

test("rejects verified without a review date", () => {
  const record = valid();
  record.verified = true;
  fails(record, /verified: true needs a last_reviewed/);
});

test("rejects a review date in the future", () => {
  const record = valid();
  record.verified = true;
  record.last_reviewed = "2999-01-01";
  fails(record, /in the future/);
});

test("rejects a malformed review date", () => {
  const record = valid();
  record.last_reviewed = "12 November 2026";
  fails(record, /YYYY-MM-DD/);
});

test("rejects a website that is not https", () => {
  const record = valid();
  record.website = "http://example.org";
  fails(record, /website must be an https URL/);
});

test("rejects a country other than Canada", () => {
  const record = valid();
  record.country = "US";
  fails(record, /country must be CA/);
});

test("rejects a contribution naming a project that is not in projects.yaml", () => {
  const record = valid();
  record.contributions[0].project = "jami";
  const errors = validateInitiative(record, { projectIds: new Set(["drupal"]) });
  assert.ok(errors.some((error) => /not in data\/projects.yaml/.test(error)));
});

test("accepts a contribution naming a project that exists", () => {
  const record = valid();
  record.contributions[0].project = "jami";
  assert.deepEqual(validateInitiative(record, { projectIds: new Set(["jami"]) }), []);
});

test("rejects an organization with no documented contribution", () => {
  const record = valid();
  record.contributions = [];
  fails(record, /at least one documented contribution/);
});

// The data side. These run against data/initiatives.yaml, so a record that
// breaks a rule fails the build rather than the page.
import { loadCatalog } from "../lib/catalog.js";

const contextFor = (catalog) => ({
  alternativesIds: new Set(catalog.alternatives.map((a) => a.id)),
  campaignIds: new Set(catalog.campaigns.map((c) => c.id)),
  themesIds: new Set(catalog.themes.map((t) => t.id)),
  projectIds: new Set(),
});

test("every published record passes the rules", () => {
  const catalog = loadCatalog();
  assert.ok(catalog.initiatives.length > 0, "the directory would be empty");
  assert.deepEqual(validateInitiatives(catalog.initiatives, contextFor(catalog)), []);
});

test("the first publication set is the ten approved organizations", () => {
  const { initiatives } = loadCatalog();
  assert.deepEqual(initiatives.map((i) => i.id).sort(), [
    "c4ds", "cds", "cira", "code-for-canada", "equalitie",
    "evolving-web", "fnigc", "koumbit", "openmedia", "savoir-faire-linux",
  ]);
});

test("at most two entries are featured, and each explains why", () => {
  const { initiatives } = loadCatalog();
  const featured = initiatives.filter((i) => i.featured);
  assert.ok(featured.length <= 2, `${featured.length} featured entries`);
  for (const entry of featured) {
    assert.ok(entry.featured_rationale?.en && entry.featured_rationale?.fr, `${entry.id} has no rationale`);
    assert.equal(entry.status, "documented-contributor", `${entry.id} is featured but only listed`);
  }
});

test("nothing is marked verified without a review date", () => {
  const { initiatives } = loadCatalog();
  for (const entry of initiatives) {
    if (entry.verified) assert.ok(entry.last_reviewed, `${entry.id} is verified with no date`);
  }
});

test("the two organizations that moved out of campaigns are in the directory", () => {
  const { initiatives, campaigns } = loadCatalog();
  const ids = new Set(initiatives.map((i) => i.id));
  assert.ok(ids.has("openmedia"));
  assert.ok(ids.has("c4ds"));
  const campaignIds = campaigns.map((c) => c.id);
  assert.ok(!campaignIds.includes("openmedia"), "openmedia should have moved out of campaigns.yaml");
  assert.ok(!campaignIds.includes("c4ds"), "c4ds should have moved out of campaigns.yaml");
});

test("every contribution is typed, sourced and bilingual", () => {
  const { initiatives } = loadCatalog();
  for (const entry of initiatives) {
    for (const contribution of entry.contributions) {
      assert.ok(contribution.sources.length > 0, `${entry.id}: a contribution has no source`);
      assert.ok(contribution.description.en && contribution.description.fr, `${entry.id}: contribution is not bilingual`);
    }
  }
});

// The directory groups organizations by their first category. If a record
// ever appeared twice, or not at all, the page would quietly lose or duplicate
// it.
import catalogData from "../src/_data/catalog.js";

test("every initiative appears in exactly one directory group", () => {
  const catalog = catalogData();
  const placed = catalog.initiativeGroups.flatMap((group) => group.initiatives.map((entry) => entry.id));
  assert.equal(placed.length, catalog.initiatives.length, "an entry is missing from every group");
  assert.equal(new Set(placed).size, placed.length, "an entry appears in more than one group");
});

test("theme associations agree in both directions", () => {
  const catalog = catalogData();
  for (const theme of catalog.themes) {
    for (const entry of theme.initiatives) {
      assert.ok(
        entry.relationships.themes.includes(theme.id),
        `${entry.id} is shown on theme "${theme.id}" but does not name it`
      );
    }
  }
  for (const entry of catalog.initiatives) {
    for (const id of entry.relationships.themes) {
      const theme = catalog.themes.find((candidate) => candidate.id === id);
      assert.ok(theme, `${entry.id} names a theme that does not exist: ${id}`);
      assert.ok(
        theme.initiatives.includes(entry),
        `${entry.id} names theme "${id}" but is not shown on it`
      );
    }
  }
});

test("no theme claims an organization the directory does not list", () => {
  const catalog = catalogData();
  const listed = new Set(catalog.initiatives.map((entry) => entry.id));
  for (const theme of catalog.themes) {
    for (const entry of theme.initiatives) {
      assert.ok(listed.has(entry.id), `${theme.id} links to an unlisted organization`);
    }
  }
});
