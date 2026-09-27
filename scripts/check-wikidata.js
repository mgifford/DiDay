// Compares recorded ownership and headquarters with Wikidata.
// Writes reports/wikidata.md and exits 1 if anything disagrees.
// It never edits the data: a person decides what is correct.
import fs from "node:fs";
import { loadCatalog } from "../lib/catalog.js";
import { EXCLUDED } from "../lib/qualify.js";
import { wikidataFetcher, createResolver, compare } from "../lib/wikidata.js";

const catalog = loadCatalog();
// Wikimedia asks automated clients to identify themselves.
const userAgent = `FirstSundayOwnershipCheck/0.1 (+${catalog.site.repo})`;
const resolve = createResolver(wikidataFetcher(userAgent));

const rows = [];
for (const alt of catalog.alternatives) {
  if (!alt.wikidata) {
    rows.push({ alt, status: "no-id", issues: ["no wikidata ID in alternatives.yaml"] });
    continue;
  }
  try {
    const found = await resolve(alt.wikidata);
    rows.push({ alt, found, ...compare(alt, found, EXCLUDED) });
  } catch (err) {
    rows.push({ alt, status: "error", issues: [err.message] });
  }
}

const lines = [`# Ownership check against Wikidata`, ``, `Run: ${new Date().toISOString()}`, ``,
  `Wikidata can be wrong. Check a primary source before changing the data.`, ``];
const section = (status, title) => {
  const list = rows.filter((r) => r.status === status);
  lines.push(`## ${title} (${list.length})`, ``);
  for (const r of list) {
    const link = r.alt.wikidata ? ` [${r.alt.wikidata}](https://www.wikidata.org/wiki/${r.alt.wikidata})` : "";
    lines.push(`- **${r.alt.id}**${link}`);
    for (const i of r.issues) lines.push(`  - ${i}`);
    if (r.found?.chain?.length > 1) lines.push(`  - ownership chain: ${r.found.chain.join(" > ")}`);
  }
  lines.push(``);
};
section("mismatch", "Disagrees with our data");
section("error", "Could not check");
section("incomplete", "Wikidata incomplete");
section("no-id", "No Wikidata ID");
section("match", "Matches");

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/wikidata.md", lines.join("\n"));
console.log(lines.join("\n"));
process.exit(rows.some((r) => r.status === "mismatch" || r.status === "error") ? 1 : 0);
