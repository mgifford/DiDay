// Usage:
//   node scripts/check-links.js                  internal and external links
//   node scripts/check-links.js --internal-only  built site only, no network
// Writes reports/links.md and exits 1 if anything is broken.
// "Blocked" responses (403, 429 and similar) are listed for a person to check
// but do not fail the run, because many large sites refuse automated requests.
import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import { loadCatalog } from "../lib/catalog.js";
import { collectDataUrls, checkUrl, checkInternal, mapLimit } from "../lib/links.js";

const internalOnly = process.argv.includes("--internal-only");
const siteDir = path.resolve("_site");
const catalog = loadCatalog();
const { ignore = [] } = parseYaml(fs.readFileSync("data/link-check.yaml", "utf8")) || {};
const userAgent = `FirstSundayLinkCheck/0.1 (+${catalog.site.repo})`;

const lines = [`# Link check`, ``, `Run: ${new Date().toISOString()}`, ``];
let failed = false;

// Internal links
if (!fs.existsSync(siteDir)) {
  console.error("No _site folder. Run `npm run build` first.");
  process.exit(2);
}
const internal = checkInternal(siteDir, { pathPrefix: process.env.PATH_PREFIX || "/" });
lines.push(`## Links between pages`, ``, `Checked ${internal.pages} pages.`, ``);
if (internal.problems.length) {
  failed = true;
  for (const p of internal.problems) lines.push(`- ${p.page}: \`${p.ref}\` (${p.problem})`);
} else {
  lines.push(`No problems found.`);
}
lines.push(``);

// External links
if (!internalOnly) {
  const urls = [...collectDataUrls(catalog).entries()]
    .filter(([url]) => !ignore.some((pattern) => url.includes(pattern)));
  const results = await mapLimit(urls, 4, async ([url, where]) => ({
    url, where, ...(await checkUrl(url, { userAgent })),
  }));

  const group = (name) => results.filter((r) => r.result === name);
  const section = (title, list, note) => {
    lines.push(`## ${title} (${list.length})`, ``);
    if (note) lines.push(note, ``);
    for (const r of list) {
      const detail = r.status ? `HTTP ${r.status}` : r.error || "no response";
      lines.push(`- ${r.url} (${detail})`, `  - used in: ${r.where.join(", ")}`);
    }
    lines.push(``);
  };

  const broken = [...group("broken"), ...group("server-error"), ...group("unreachable")];
  if (broken.length) failed = true;
  section("Broken or unreachable", broken, "Fix or replace these URLs in the data files.");
  section("Blocked, check by hand", group("blocked"), "The site refused an automated request. Open these in a browser.");
  lines.push(`## Working (${group("ok").length})`, ``);
  lines.push(`Skipped by data/link-check.yaml: ${collectDataUrls(catalog).size - urls.length}`, ``);
}

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/links.md", lines.join("\n"));
console.log(lines.join("\n"));
process.exit(failed ? 1 : 0);
