// French review tracking.
//
//   npm run french                        list French text that needs review (exit 1 if any)
//   npm run french -- approve KEY [KEY]   record that a reviewer approved these pairs
//   npm run french -- approve --prefix alternatives.kobo
//   npm run french -- approve --all       approve everything currently pending
//
// Approving means a fluent reader has checked the French against the current English.
import fs from "node:fs";
import { loadCatalog } from "../lib/catalog.js";
import { collectPairs, fingerprint, pending, readLock, writeLock } from "../lib/translations.js";

const [command = "check", ...args] = process.argv.slice(2);
const catalog = loadCatalog();
const lock = readLock();

const LABELS = {
  "never-reviewed": "French never reviewed",
  "english-changed": "English changed since the French was reviewed",
  "french-changed": "French changed since it was reviewed",
  "both-changed": "Both changed since review",
};

if (command === "check") {
  const list = pending(catalog, lock);
  const lines = ["# French review", "", `Run: ${new Date().toISOString()}`, ""];
  for (const [status, label] of Object.entries(LABELS)) {
    const group = list.filter((p) => p.status === status);
    lines.push(`## ${label} (${group.length})`, "");
    for (const p of group) {
      const show = (v) => (Array.isArray(v) ? v.join(" / ") : v);
      lines.push(`- \`${p.key}\``, `  - en: ${show(p.en)}`, `  - fr: ${show(p.fr)}`);
    }
    lines.push("");
  }
  lines.push(`After review, run: \`npm run french -- approve KEY\``, "");
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync("reports/french.md", lines.join("\n"));
  console.log(lines.join("\n"));
  console.log(`${list.length} French text(s) need review.`);
  process.exit(list.length ? 1 : 0);
}

if (command === "approve") {
  const pairs = collectPairs(catalog);
  let chosen;
  if (args[0] === "--all") chosen = pending(catalog, lock);
  else if (args[0] === "--prefix") chosen = pairs.filter((p) => p.key.startsWith(args[1]));
  else chosen = pairs.filter((p) => args.includes(p.key));

  const unknown = args[0]?.startsWith("--") ? [] : args.filter((k) => !pairs.some((p) => p.key === k));
  if (unknown.length) {
    console.error(`Unknown key(s): ${unknown.join(", ")}`);
    process.exit(1);
  }
  for (const p of chosen) lock[p.key] = { en: fingerprint(p.en), fr: fingerprint(p.fr) };
  // Drop entries for text that no longer exists.
  const live = new Set(pairs.map((p) => p.key));
  for (const key of Object.keys(lock)) if (!live.has(key)) delete lock[key];
  writeLock(lock);
  console.log(`Approved ${chosen.length} French text(s).`);
  process.exit(0);
}

console.error(`Unknown command "${command}". Use "check" or "approve".`);
process.exit(1);
