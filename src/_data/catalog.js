import { loadCatalog } from "../../lib/catalog.js";
import { pending } from "../../lib/translations.js";

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
  return catalog;
}
