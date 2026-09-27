// Tracks whether each French text has been reviewed against the current English.
// data/translations.lock.yaml records, for every bilingual field, a fingerprint
// of the English and French text at the moment a reviewer approved the pair.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { load as parseYaml, dump as dumpYaml } from "js-yaml";

export const LOCK_FILE = path.resolve(process.cwd(), "data/translations.lock.yaml");

export const fingerprint = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 12);

const isPair = (v) => v && typeof v === "object" && !Array.isArray(v) && "en" in v && "fr" in v;

// Every { en, fr } pair in the content, keyed by where it lives.
export function collectPairs(catalog) {
  const pairs = [];
  const walk = (value, key) => {
    if (isPair(value)) return pairs.push({ key, en: value.en, fr: value.fr });
    if (Array.isArray(value)) value.forEach((v, i) => walk(v, v && v.id ? `${key}.${v.id}` : `${key}[${i}]`));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, `${key}.${k}`);
  };
  for (const name of ["site", "strings", "categories", "alternatives", "recipes"]) walk(catalog[name], name);
  // Recipe steps are stored as steps: { en: [...], fr: [...] }, which the walk already treats as a pair.
  return pairs;
}

export function readLock() {
  if (!fs.existsSync(LOCK_FILE)) return {};
  return parseYaml(fs.readFileSync(LOCK_FILE, "utf8")) || {};
}

export function writeLock(lock) {
  const sorted = Object.fromEntries(Object.entries(lock).sort(([a], [b]) => a.localeCompare(b)));
  const header = "# Written by `npm run french -- approve`. Do not edit by hand.\n" +
    "# Each entry: fingerprints of the English and French text a reviewer approved together.\n";
  fs.writeFileSync(LOCK_FILE, header + dumpYaml(sorted, { lineWidth: -1 }));
}

// never-reviewed | english-changed | french-changed | both-changed | ok
export function status(pair, lock) {
  const entry = lock[pair.key];
  if (!entry) return "never-reviewed";
  const enChanged = entry.en !== fingerprint(pair.en);
  const frChanged = entry.fr !== fingerprint(pair.fr);
  if (enChanged && frChanged) return "both-changed";
  if (enChanged) return "english-changed";
  if (frChanged) return "french-changed";
  return "ok";
}

export function pending(catalog, lock = readLock()) {
  return collectPairs(catalog)
    .map((p) => ({ ...p, status: status(p, lock) }))
    .filter((p) => p.status !== "ok");
}
