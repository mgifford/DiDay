// Ownership lookup in Wikidata. The fetcher is injected so tests can use
// saved responses instead of the network.
//
// Properties used:
//   P749 parent organization, P127 owned by, P17 country,
//   P159 headquarters location, P297 ISO 3166-1 alpha-2 code, P31 instance of.
// Wikidata can be wrong or out of date. Results are for a person to review.

const HUMAN = "Q5";
const MAX_DEPTH = 8;

export function wikidataFetcher(userAgent) {
  return async (ids) => {
    const url = new URL("https://www.wikidata.org/w/api.php");
    url.search = new URLSearchParams({
      action: "wbgetentities", ids: ids.join("|"), props: "claims|labels",
      languages: "en", format: "json",
    });
    const res = await fetch(url, { headers: { "user-agent": userAgent } });
    if (!res.ok) throw new Error(`Wikidata returned HTTP ${res.status}`);
    return (await res.json()).entities;
  };
}

// Current values of a property: skip deprecated and ended statements,
// and prefer statements marked "preferred" when there are any.
export function currentValues(entity, prop) {
  const statements = (entity?.claims?.[prop] || []).filter(
    (s) => s.rank !== "deprecated" && !s.qualifiers?.P582 && s.mainsnak?.snaktype === "value"
  );
  const preferred = statements.filter((s) => s.rank === "preferred");
  return (preferred.length ? preferred : statements).map((s) => {
    const v = s.mainsnak.datavalue.value;
    return typeof v === "object" && v.id ? v.id : v;
  });
}

export function createResolver(fetchEntities) {
  const cache = new Map();
  const get = async (id) => {
    if (!cache.has(id)) {
      const entities = await fetchEntities([id]);
      cache.set(id, entities[id]);
    }
    return cache.get(id);
  };
  const label = (e, id) => e?.labels?.en?.value || id;

  async function isoOf(countryId) {
    const codes = currentValues(await get(countryId), "P297");
    return codes[0] || null;
  }

  // Country of an organization: P17, or the country of its headquarters.
  async function countryOf(entity) {
    let countries = currentValues(entity, "P17");
    if (!countries.length) {
      for (const loc of currentValues(entity, "P159")) {
        countries.push(...currentValues(await get(loc), "P17"));
      }
    }
    countries = [...new Set(countries)];
    if (countries.length !== 1) return { code: null, note: countries.length ? "more than one country" : "no country" };
    return { code: await isoOf(countries[0]), note: "" };
  }

  async function headquartersOf(entity) {
    const locs = currentValues(entity, "P159");
    if (!locs.length) return { code: null, note: "no headquarters" };
    const countries = [...new Set((await Promise.all(locs.map(async (l) => currentValues(await get(l), "P17")))).flat())];
    if (countries.length !== 1) return { code: null, note: "headquarters in more than one country" };
    return { code: await isoOf(countries[0]), note: "" };
  }

  // Follow parent organization, then owned by, up to the top owner.
  async function ownerChain(id) {
    const chain = [];
    const seen = new Set();
    let current = id;
    while (current && chain.length < MAX_DEPTH) {
      if (seen.has(current)) return { chain, stop: "ownership loop" };
      seen.add(current);
      const e = await get(current);
      chain.push({ id: current, label: label(e, current), entity: e });
      let up = currentValues(e, "P749");
      if (!up.length) up = currentValues(e, "P127");
      if (up.length === 0) return { chain, stop: "" };
      if (up.length > 1) return { chain, stop: `several owners listed (${up.join(", ")})` };
      current = up[0];
    }
    return { chain, stop: chain.length >= MAX_DEPTH ? "chain too long" : "" };
  }

  return async function resolve(id) {
    const item = await get(id);
    if (!item || item.missing !== undefined) return { error: `item ${id} not found` };
    const { chain, stop } = await ownerChain(id);
    const top = chain[chain.length - 1];
    const notes = [];
    if (stop) notes.push(stop);
    let ownership = { code: null, note: "" };
    if (!stop) {
      if (currentValues(top.entity, "P31").includes(HUMAN)) notes.push("top owner is a person");
      else ownership = await countryOf(top.entity);
    }
    if (ownership.note) notes.push(`owner: ${ownership.note}`);
    // A service item often has no headquarters; fall back to its first owner.
    let hq = await headquartersOf(item);
    if (hq.code === null && chain.length > 1) hq = await headquartersOf(chain[1].entity);
    if (hq.note) notes.push(hq.note);
    return {
      chain: chain.map((c) => `${c.label} (${c.id})`),
      ownership: ownership.code,
      headquarters: hq.code,
      notes,
    };
  };
}

// Compare what we recorded with what Wikidata says.
export function compare(alt, found, excluded) {
  const issues = [];
  if (found.error) return { status: "error", issues: [found.error] };
  if (found.ownership && excluded.has(found.ownership)) {
    issues.push(`Wikidata says owned in ${found.ownership}, which is never listed`);
  }
  if (found.ownership && found.ownership !== alt.ownership) {
    issues.push(`ownership: recorded ${alt.ownership ?? "unknown"}, Wikidata ${found.ownership}`);
  }
  if (found.headquarters && found.headquarters !== alt.headquarters) {
    issues.push(`headquarters: recorded ${alt.headquarters ?? "unknown"}, Wikidata ${found.headquarters}`);
  }
  if (issues.length) return { status: "mismatch", issues };
  if (!found.ownership || !found.headquarters) return { status: "incomplete", issues: found.notes };
  return { status: "match", issues: [] };
}
