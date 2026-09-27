// Runs axe-core on every built page, in light and dark colour schemes and at
// desktop and phone widths.
//
// Browsers: Firefox by default (open source engine from a non-profit).
//   node scripts/check-a11y.js --browsers=firefox,chromium
// Playwright's Firefox is a patched build of Firefox, not the release version.
// Fails on WCAG 2.2 A and AA violations. Best-practice findings and
// "needs review" results are reported but do not fail the run.
// Writes reports/a11y.md.
//
// Automated tools find only part of the accessibility problems on a page.
// Manual and assistive technology testing are still needed.
import fs from "node:fs";
import path from "node:path";
import { firefox, chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { serve } from "../lib/serve.js";

const siteDir = path.resolve("_site");
if (!fs.existsSync(siteDir)) {
  console.error("No _site folder. Run `npm run build` first.");
  process.exit(2);
}

const ENGINES = { firefox, chromium };
const arg = process.argv.find((a) => a.startsWith("--browsers="));
const BROWSERS = (arg ? arg.split("=")[1] : "firefox").split(",").map((b) => b.trim());
for (const b of BROWSERS) {
  if (!ENGINES[b]) {
    console.error(`Unknown browser "${b}". Use firefox or chromium.`);
    process.exit(2);
  }
}

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const SETTINGS = [
  { name: "light, desktop", colorScheme: "light", viewport: { width: 1280, height: 800 } },
  { name: "dark, desktop", colorScheme: "dark", viewport: { width: 1280, height: 800 } },
  { name: "light, phone", colorScheme: "light", viewport: { width: 375, height: 740 } },
  { name: "dark, phone", colorScheme: "dark", viewport: { width: 375, height: 740 } },
];

const pages = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith(".html")) pages.push("/" + path.relative(siteDir, full).replace(/index\.html$/, ""));
  }
};
walk(siteDir);
pages.sort();

// Must match the prefix baked into the built site's hrefs (including the
// stylesheet link), or every asset 404s and pages render unstyled.
const pathPrefix = process.env.PATH_PREFIX || "/";
const server = await serve(siteDir, { pathPrefix });
const findings = { violation: new Map(), bestPractice: new Map(), review: new Map() };
const record = (bucket, result, where) => {
  const key = result.id;
  if (!bucket.has(key)) bucket.set(key, { rule: result, where: new Set() });
  const entry = bucket.get(key);
  for (const node of result.nodes) entry.where.add(`${where}: \`${node.target.join(" ")}\``);
};

try {
  for (const name of BROWSERS) {
    const browser = await ENGINES[name].launch();
    try {
      for (const setting of SETTINGS) {
        const context = await browser.newContext({ colorScheme: setting.colorScheme, viewport: setting.viewport });
        const page = await context.newPage();
        for (const p of pages) {
          const url = pathPrefix === "/" ? p : pathPrefix.replace(/\/$/, "") + p;
          await page.goto(server.url + url);
          const results = await new AxeBuilder({ page }).withTags([...WCAG_TAGS, "best-practice"]).analyze();
          const where = `${p} (${name}, ${setting.name})`;
          for (const v of results.violations) {
            const isWcag = v.tags.some((t) => WCAG_TAGS.includes(t));
            record(isWcag ? findings.violation : findings.bestPractice, v, where);
          }
          for (const r of results.incomplete) record(findings.review, r, where);
        }
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  server.close();
}

const lines = ["# Accessibility check (axe-core)", "", `Run: ${new Date().toISOString()}`, "",
  `Checked ${pages.length} pages in ${BROWSERS.join(" then ")}, ${SETTINGS.length} settings each: ${SETTINGS.map((s) => s.name).join("; ")}.`, "",
  "Automated tools find only part of the problems. Manual and assistive technology testing are still needed.", ""];
const section = (title, bucket) => {
  lines.push(`## ${title} (${bucket.size} rules)`, "");
  for (const { rule, where } of bucket.values()) {
    lines.push(`### ${rule.id}: ${rule.help}`, "", `${rule.helpUrl}`, "");
    const list = [...where];
    for (const w of list.slice(0, 20)) lines.push(`- ${w}`);
    if (list.length > 20) lines.push(`- and ${list.length - 20} more`);
    lines.push("");
  }
};
section("WCAG failures", findings.violation);
section("Best practice", findings.bestPractice);
section("Needs review by a person", findings.review);

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/a11y.md", lines.join("\n"));
console.log(lines.join("\n"));
process.exit(findings.violation.size ? 1 : 0);
