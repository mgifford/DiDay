// Validation for data/initiatives.yaml, the Canadian ecosystem directory.
//
// The directory is not built yet: this module and its tests land first, so the
// rules are agreed before there is a catalogue to argue about. PR 2 adds the
// data and calls this from scripts/validate.js.
//
// The rules encode the editorial policy in docs/ECOSYSTEM-EDITORIAL-POLICY.md.
// If a rule changes, change that document too.
import { toDate } from "./reviews.js";

// What kind of organization it is. One value.
export const ORGANIZATION_TYPES = [
  "non-profit",
  "cooperative",
  "company",
  "public-sector",
  "foundation",
  "community-group",
];

// What it contributes. An organization can hold several.
export const CATEGORIES = [
  "open-source-development",
  "funding",
  "open-governance",
  "public-infrastructure",
  "digital-rights",
  "indigenous-data-sovereignty",
];

// How the organization is Canadian. "Canadian-owned" is deliberately absent:
// ownership is a corporate fact, not evidence of contribution, and the
// directory is about contribution.
export const CANADIAN_CONNECTIONS = [
  "headquartered",
  "canadian-operations",
  "canadian-led-project",
  "canadian-members",
];

// What a single contribution actually is. "commit-count" is deliberately
// absent: volume is not the evidence the directory accepts.
export const CONTRIBUTION_TYPES = [
  "upstream-development",
  "maintenance",
  "documentation",
  "accessibility",
  "security",
  "funding",
  "governance",
  "standards",
  "hosting",
  "training",
  "public-infrastructure",
  // Advocacy is a contribution: a digital-rights organization contributes
  // published analysis and campaigning, not code. Without this value the
  // schema could not describe half the organizations the policy invites.
  "advocacy",
];

// The two editorial states. "Featured" sits on top of documented-contributor;
// it is a selection, not a third rank.
export const STATUSES = ["listed", "documented-contributor"];

const isText = (value) => typeof value === "string" && value.trim().length > 0;
const isBilingual = (value) => value && isText(value.en) && isText(value.fr);
const isHttps = (value) => typeof value === "string" && /^https:\/\/\S+$/.test(value);
const isSlug = (value) => typeof value === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);

// Validates one record. `context` supplies the ids of the other collections,
// so a relationship to an alternative, campaign or theme that no longer exists
// is caught here rather than becoming a dead link at build time.
export function validateInitiative(record, context = {}) {
  const errors = [];
  const where = `initiatives.${record?.id ?? "(no id)"}`;
  const add = (message) => errors.push(`${where}: ${message}`);
  const known = (list, id) => !list || list.has(id);

  if (!isSlug(record?.id)) add("id must be lower-case words joined by hyphens");

  if (!isText(record?.name)) add("name is required");
  if (!isHttps(record?.website)) add("website must be an https URL");
  if (record?.country !== "CA") add("country must be CA");

  if (!ORGANIZATION_TYPES.includes(record?.organization_type)) {
    add(`organization_type must be one of ${ORGANIZATION_TYPES.join(", ")}`);
  }

  if (!Array.isArray(record?.categories) || record.categories.length === 0) {
    add("needs at least one category");
  } else {
    for (const category of record.categories) {
      if (!CATEGORIES.includes(category)) add(`unknown category "${category}"`);
    }
  }

  if (!isBilingual(record?.summary)) add("summary needs English and French text");

  // How it is Canadian, and the source that says so.
  if (!CANADIAN_CONNECTIONS.includes(record?.canadian_connection?.type)) {
    add(`canadian_connection.type must be one of ${CANADIAN_CONNECTIONS.join(", ")}`);
  }
  if (!isHttps(record?.canadian_connection?.evidence)) {
    add("canadian_connection.evidence must be an https URL");
  }

  // Contributions: the heart of the record. Each needs a type, both languages,
  // and at least one source. A claim with no source is not evidence.
  if (!Array.isArray(record?.contributions) || record.contributions.length === 0) {
    add("needs at least one documented contribution");
  } else {
    record.contributions.forEach((contribution, index) => {
      const at = `contributions[${index}]`;
      if (!CONTRIBUTION_TYPES.includes(contribution?.type)) {
        add(`${at}.type must be one of ${CONTRIBUTION_TYPES.join(", ")}`);
      }
      if (!isBilingual(contribution?.description)) {
        add(`${at}.description needs English and French text`);
      }
      if (!Array.isArray(contribution?.sources) || contribution.sources.length === 0) {
        add(`${at} needs at least one source`);
      } else {
        contribution.sources.forEach((url, sourceIndex) => {
          if (!isHttps(url)) add(`${at}.sources[${sourceIndex}] must be an https URL`);
        });
      }
      if (contribution?.project !== undefined && contribution.project !== null && !isSlug(contribution.project)) {
        add(`${at}.project must be a project id, or null`);
      }
      if (contribution?.project && !known(context.projectIds, contribution.project)) {
        add(`${at}.project "${contribution.project}" is not in data/projects.yaml`);
      }
    });
  }

  // Relationships to the collections that already exist.
  const relationships = record?.relationships ?? {};
  const checkIds = (field, list) => {
    if (field === undefined) return;
    if (!Array.isArray(field)) {
      add("relationships." + list + " must be a list");
      return;
    }
    for (const id of field) {
      if (!isSlug(id)) add(`relationships.${list}: "${id}" is not an id`);
      if (!known(context[`${list}Ids`], id)) add(`relationships.${list}: "${id}" does not exist`);
    }
  };
  checkIds(relationships.alternatives, "alternatives");
  checkIds(relationships.campaigns, "campaigns");
  checkIds(relationships.themes, "themes");

  // Evidence table for the record as a whole.
  if (!Array.isArray(record?.sources) || record.sources.length === 0) {
    add("needs at least one source");
  } else {
    record.sources.forEach((source, index) => {
      if (!isHttps(source?.url)) add(`sources[${index}].url must be an https URL`);
      if (!Array.isArray(source?.supports) || source.supports.length === 0) {
        add(`sources[${index}] needs a "supports" list`);
      }
    });
  }

  if (!STATUSES.includes(record?.status)) {
    add(`status must be one of ${STATUSES.join(", ")}`);
  }

  // Featured is an editorial selection of a documented contributor, and it
  // must say why in both languages. Being large or well known is not a reason.
  if (record?.featured === true) {
    if (record.status !== "documented-contributor") {
      add("featured entries must have status: documented-contributor");
    }
    if (!isBilingual(record?.featured_rationale)) {
      add("featured entries need a featured_rationale in English and French");
    }
  } else if (record?.featured_rationale) {
    add("featured_rationale is set but featured is not true");
  }

  // Review state.
  const reviewed = record?.last_reviewed ?? null;
  if (reviewed !== null) {
    const date = toDate(reviewed);
    if (!date) add("last_reviewed must be a date written as YYYY-MM-DD");
    else if (date > new Date()) add("last_reviewed is in the future");
  }
  if (record?.verified === true && !toDate(reviewed)) {
    add("verified: true needs a last_reviewed date");
  }

  return errors;
}

// Validates the collection: shared rules, duplicate ids, and one pass over
// each record.
export function validateInitiatives(records = [], context = {}) {
  const errors = [];
  const seen = new Set();
  for (const record of records) {
    if (seen.has(record?.id)) errors.push(`initiatives: duplicate id "${record.id}"`);
    seen.add(record?.id);
  }
  for (const record of records) errors.push(...validateInitiative(record, context));
  return errors;
}
