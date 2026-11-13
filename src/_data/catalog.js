import { loadCatalog } from "../../lib/catalog.js";
import { pending } from "../../lib/translations.js";
import { CATEGORIES } from "../../lib/initiatives.js";

export default function () {
  const catalog = loadCatalog();
  // Worked out before drafts are removed so keys match the data files.
  catalog.frPending = pending(catalog).map((p) => p.key);
  // Drafts stay in the data files but are never published.
  catalog.alternatives = catalog.alternatives.filter((a) => !a.draft);
  // One page per language per recipe.
  catalog.recipePages = catalog.site.languages.flatMap((lang) =>
    catalog.recipes.map((recipe) => ({ lang, recipe }))
  );
  // One page per language per monthly theme.
  catalog.themePages = catalog.site.languages.flatMap((lang) =>
    catalog.themes.map((theme) => ({ lang, theme }))
  );
  // Reverse lookup: the organizations that named a theme. The relationship is
  // stored once, on the initiative, so it cannot drift.
  for (const theme of catalog.themes) {
    theme.initiatives = catalog.initiatives.filter((entry) => (entry.relationships?.themes || []).includes(theme.id));
  }
  catalog.featuredInitiatives = catalog.initiatives.filter((entry) => entry.featured);
  // The directory groups organizations by their first category, so each one
  // appears once. The remaining categories are shown as labels on the card.
  // Every source URL for an entry, once, for the "sources" disclosure.
  for (const entry of catalog.initiatives) {
    entry.sourceLinks = [...new Set([
      ...(entry.sources || []).map((source) => source.url),
      ...(entry.contributions || []).flatMap((contribution) => contribution.sources || []),
    ])];
  }
  catalog.initiativeGroups = CATEGORIES
    .map((id) => ({ id, initiatives: catalog.initiatives.filter((entry) => entry.categories[0] === id) }))
    .filter((group) => group.initiatives.length > 0);
  return catalog;
}
