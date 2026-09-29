// Checks the content before every build. Fails with a readable list of problems.
import { loadCatalog } from "../lib/catalog.js";
import { reasons, EXCLUDED } from "../lib/qualify.js";
import { toDate } from "../lib/reviews.js";

const c = loadCatalog();
const langs = c.site.languages;
const errors = [];
const warnings = [];
const CLAIMS = ["headquarters", "ownership", "open_source"];
const ids = (list) => new Set(list.map((x) => x.id));

const alternativeIds = ids(c.alternatives);
const categoryIds = ids(c.categories);
const recipeIds = ids(c.recipes);
const cancelIds = ids(c.cancel);
const countryCodes = new Set(Object.keys(c.strings.countries));

function bilingual(value, where) {
  if (typeof value === "string") return; // proper names need no translation
  for (const lang of langs) {
    if (!value || value[lang] === undefined || value[lang] === "") {
      errors.push(`${where}: missing "${lang}" text`);
    }
  }
}

function unique(list, label) {
  const seen = new Set();
  for (const item of list) {
    if (seen.has(item.id)) errors.push(`${label}: duplicate id "${item.id}"`);
    seen.add(item.id);
  }
}

function country(code, where) {
  if (code !== null && !countryCodes.has(code)) {
    errors.push(`${where}: unknown country "${code}". Add it to data/strings.yaml under countries.`);
  }
}

for (const [key, value] of Object.entries(c.strings)) {
  if (key === "countries") {
    for (const [code, names] of Object.entries(value)) bilingual(names, `strings.countries.${code}`);
  } else {
    bilingual(value, `strings.${key}`);
  }
}

unique(c.categories, "categories");
unique(c.alternatives, "alternatives");
unique(c.cancel, "cancel");
unique(c.recipes, "recipes");
unique(c.campaigns, "campaigns");

for (const cat of c.categories) bilingual(cat.name, `categories.${cat.id}.name`);

for (const a of c.alternatives) {
  const where = `alternatives.${a.id}`;
  bilingual(a.name, `${where}.name`);
  bilingual(a.notes, `${where}.notes`);
  if (!categoryIds.has(a.category)) errors.push(`${where}: unknown category "${a.category}"`);
  country(a.headquarters, `${where}.headquarters`);
  country(a.ownership, `${where}.ownership`);
  if (!Array.isArray(a.sources) || a.sources.length === 0) {
    errors.push(`${where}: needs at least one source`);
    continue;
  }
  a.sources.forEach((s, i) => {
    if (!s.url || !s.title) errors.push(`${where}.sources[${i}]: needs title and url`);
    if (!Array.isArray(s.supports)) errors.push(`${where}.sources[${i}]: needs "supports" (use [] for background sources)`);
    for (const claim of s.supports || []) {
      if (!CLAIMS.includes(claim)) errors.push(`${where}.sources[${i}]: unknown claim "${claim}"`);
    }
  });

  // Evidence: each claim made must be supported by at least one source.
  const supported = new Set(a.sources.flatMap((s) => s.supports || []));
  if (a.headquarters !== null && !supported.has("headquarters")) errors.push(`${where}: no source supports headquarters`);
  if (a.ownership !== null && !supported.has("ownership")) errors.push(`${where}: no source supports ownership`);
  if (a.open_source === true && !supported.has("open_source")) errors.push(`${where}: no source supports open_source`);

  // Hard exclusion: no exception can override this.
  if (EXCLUDED.has(a.ownership)) {
    errors.push(`${where}: owned in ${a.ownership}, which is never listed. Remove this entry.`);
    continue;
  }

  // Inclusion: Canadian owned, open source, or European owned. Otherwise an exception.
  const why = reasons(a);
  if (a.draft) {
    warnings.push(`${where}: draft, not published`);
  } else if (why.length === 0 && !a.exception) {
    errors.push(`${where}: not Canadian owned, open source or European owned. Add an "exception" with a reason, set draft: true, or remove it.`);
  } else if (why.length > 0 && a.exception) {
    errors.push(`${where}: qualifies as ${why.join(", ")}, so it should not have an exception`);
  }
  if (a.exception) bilingual(a.exception, `${where}.exception`);
}

for (const camp of c.campaigns) {
  const where = `campaigns.${camp.id}`;
  bilingual(camp.description, `${where}.description`);
  country(camp.country, `${where}.country`);
  if (!Array.isArray(camp.sources) || camp.sources.length === 0) {
    errors.push(`${where}: needs at least one source`);
    continue;
  }
  camp.sources.forEach((s, i) => {
    if (!s.url || !s.title) errors.push(`${where}.sources[${i}]: needs title and url`);
  });
}

const published = new Set(c.alternatives.filter((a) => !a.draft).map((a) => a.id));
for (const list of [...c.recipes, ...c.cancel]) {
  for (const id of list.alternatives) {
    if (alternativeIds.has(id) && !published.has(id)) warnings.push(`${list.id}: "${id}" is a draft and will not be shown`);
  }
}

for (const x of c.cancel) {
  const where = `cancel.${x.id}`;
  if (!x.cancel_url) errors.push(`${where}: needs cancel_url`);
  if (!x.source) errors.push(`${where}: needs source`);
  country(x.ownership, `${where}.ownership`);
  for (const id of x.alternatives) {
    if (!alternativeIds.has(id)) errors.push(`${where}: unknown alternative "${id}"`);
  }
  if (x.recipe !== null && !recipeIds.has(x.recipe)) errors.push(`${where}: unknown recipe "${x.recipe}"`);
}

for (const r of c.recipes) {
  const where = `recipes.${r.id}`;
  bilingual(r.title, `${where}.title`);
  if (!["easy", "average", "hard"].includes(r.difficulty)) {
    errors.push(`${where}: difficulty must be easy, average or hard`);
  }
  for (const id of r.alternatives) {
    if (!alternativeIds.has(id)) errors.push(`${where}: unknown alternative "${id}"`);
  }
  for (const id of r.replaces) {
    if (!cancelIds.has(id)) errors.push(`${where}: unknown cancel entry "${id}"`);
  }
  for (const lang of langs) {
    if (!r.steps?.[lang]?.length) errors.push(`${where}: missing "${lang}" steps`);
  }
  if (r.steps?.en?.length !== r.steps?.fr?.length) {
    errors.push(`${where}: English and French have a different number of steps`);
  }
}

// Review dates
for (const kind of ["alternatives", "cancel", "recipes"]) {
  if (!c.review?.max_age_months?.[kind]) errors.push(`review.yaml: missing max_age_months.${kind}`);
  for (const item of c[kind]) {
    const where = `${kind}.${item.id}`;
    if (item.last_reviewed !== undefined && item.last_reviewed !== null) {
      const d = toDate(item.last_reviewed);
      if (!d) errors.push(`${where}: last_reviewed must be a date written as YYYY-MM-DD`);
      else if (d > new Date()) errors.push(`${where}: last_reviewed is in the future`);
    }
    if (item.verified === true && !toDate(item.last_reviewed)) {
      errors.push(`${where}: verified: true needs a last_reviewed date`);
    }
  }
}

if (errors.length) {
  console.error(`Content check failed with ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
for (const w of warnings) console.warn(`  note: ${w}`);
console.log("Content check passed.");
