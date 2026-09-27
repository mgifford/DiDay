// Inclusion rules. An alternative is listed if it is Canadian owned,
// open source, or European owned, and is ranked in that order.
// Anything else needs a written exception and is ranked last.
import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

const regions = parseYaml(fs.readFileSync(path.resolve(process.cwd(), "data/regions.yaml"), "utf8"));
const EUROPE = new Set(regions.europe);
export const EXCLUDED = new Set(regions.excluded);
const ORDER = ["canadian", "open_source", "european"];

export function reasons(alt) {
  const out = [];
  if (alt.ownership === "CA") out.push("canadian");
  if (alt.open_source === true) out.push("open_source");
  if (alt.ownership && EUROPE.has(alt.ownership)) out.push("european");
  return out;
}

export function rank(alt) {
  const r = reasons(alt);
  return r.length ? Math.min(...r.map((x) => ORDER.indexOf(x))) : ORDER.length;
}

const sortName = (alt) => (typeof alt.name === "string" ? alt.name : alt.name.en);

export function ranked(list) {
  return [...list].sort((a, b) => rank(a) - rank(b) || sortName(a).localeCompare(sortName(b)));
}
