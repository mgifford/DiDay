// Loads the YAML content once. Used by Eleventy and by the validator.
import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

const dataDir = path.resolve(process.cwd(), "data");
const load = (file) => parseYaml(fs.readFileSync(path.join(dataDir, file), "utf8"));

export function loadCatalog() {
  return {
    site: load("site.yaml"),
    strings: load("strings.yaml"),
    categories: load("categories.yaml"),
    alternatives: load("alternatives.yaml"),
    cancel: load("cancel.yaml"),
    recipes: load("recipes.yaml"),
    campaigns: load("campaigns.yaml"),
    review: load("review.yaml"),
  };
}
