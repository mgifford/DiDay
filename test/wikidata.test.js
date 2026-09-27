import { test } from "node:test";
import assert from "node:assert/strict";
import { createResolver, compare, currentValues } from "../lib/wikidata.js";

// Build minimal Wikidata entities: claim(prop, value, { rank, ended })
const claim = (value, { rank = "normal", ended = false } = {}) => ({
  rank,
  mainsnak: { snaktype: "value", datavalue: { value: /^Q\d+$/.test(value) ? { id: value } : value } },
  ...(ended ? { qualifiers: { P582: [{}] } } : {}),
});
const entity = (id, label, claims) => ({
  id, labels: { en: { value: label } },
  claims: Object.fromEntries(Object.entries(claims).map(([p, vs]) => [p, vs.map((v) => (typeof v === "string" ? claim(v) : v))])),
});

const world = {
  Q16: entity("Q16", "Canada", { P297: ["CA"] }),
  Q17: entity("Q17", "Japan", { P297: ["JP"] }),
  Q148: entity("Q148", "China", { P297: ["CN"] }),
  Q39: entity("Q39", "Switzerland", { P297: ["CH"] }),
  Q172: entity("Q172", "Toronto", { P17: ["Q16"] }),
  // Kobo: Toronto headquarters, parent Rakuten in Japan
  Q389251: entity("Q389251", "Rakuten Kobo Inc.", { P749: ["Q973054"], P159: ["Q172"] }),
  Q973054: entity("Q973054", "Rakuten Group", { P17: ["Q17"] }),
  // A company whose old Canadian owner ended and a Chinese owner is current
  Q900: entity("Q900", "SoldCo", {
    P159: ["Q172"],
    P127: [claim("Q901", { ended: true }), claim("Q902")],
  }),
  Q901: entity("Q901", "Old Owner", { P17: ["Q16"] }),
  Q902: entity("Q902", "New Owner", { P17: ["Q148"] }),
  // Two owners listed at once
  Q910: entity("Q910", "JointCo", { P127: ["Q901", "Q973054"], P159: ["Q172"] }),
  // Owned by a person
  Q920: entity("Q920", "PersonCo", { P127: ["Q921"], P159: ["Q172"] }),
  Q921: entity("Q921", "A Person", { P31: ["Q5"] }),
  // Service with no headquarters; owner has one (Proton Mail pattern)
  Q930: entity("Q930", "MailService", { P127: ["Q931"] }),
  Q931: entity("Q931", "MailCo", { P17: ["Q39"], P159: ["Q932"] }),
  Q932: entity("Q932", "Geneva", { P17: ["Q39"] }),
};
const fetcher = async (ids) => Object.fromEntries(ids.map((id) => [id, world[id] ?? { id, missing: "" }]));
const excluded = new Set(["RU", "BY", "CN", "HK", "MO"]);

test("follows parent organization to the owner's country", async () => {
  const found = await createResolver(fetcher)("Q389251");
  assert.equal(found.ownership, "JP");
  assert.equal(found.headquarters, "CA");
  const result = compare({ ownership: "JP", headquarters: "CA" }, found, excluded);
  assert.equal(result.status, "match");
});

test("ignores ended ownership and flags an excluded new owner", async () => {
  const found = await createResolver(fetcher)("Q900");
  assert.equal(found.ownership, "CN");
  const result = compare({ ownership: "CA", headquarters: "CA" }, found, excluded);
  assert.equal(result.status, "mismatch");
  assert.ok(result.issues.some((i) => i.includes("never listed")));
});

test("stops when several owners are listed", async () => {
  const found = await createResolver(fetcher)("Q910");
  assert.equal(found.ownership, null);
  assert.equal(compare({ ownership: "CA", headquarters: "CA" }, found, excluded).status, "incomplete");
});

test("does not assign a country to a person", async () => {
  const found = await createResolver(fetcher)("Q920");
  assert.equal(found.ownership, null);
  assert.ok(found.notes.includes("top owner is a person"));
});

test("uses the owner's headquarters when a service has none", async () => {
  const found = await createResolver(fetcher)("Q930");
  assert.equal(found.headquarters, "CH");
  assert.equal(found.ownership, "CH");
});

test("reports a missing item", async () => {
  const found = await createResolver(fetcher)("Q999999");
  assert.equal(compare({}, found, excluded).status, "error");
});

test("preferred rank wins and deprecated is skipped", () => {
  const e = entity("Q1", "x", { P127: [claim("Q2", { rank: "deprecated" }), claim("Q3"), claim("Q4", { rank: "preferred" })] });
  assert.deepEqual(currentValues(e, "P127"), ["Q4"]);
});
