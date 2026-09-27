import { HtmlBasePlugin } from "@11ty/eleventy";
import { loadCatalog } from "./lib/catalog.js";
import { ranked, reasons } from "./lib/qualify.js";
import { reviewStatus } from "./lib/reviews.js";

export default function (eleventyConfig) {
  const { strings, review, site } = loadCatalog();

  // Rewrites absolute links for GitHub project pages (/repo-name/).
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js" });
  eleventyConfig.addWatchTarget("data/");

  // Interface string: {{ "nav_home" | t(lang) }}
  eleventyConfig.addFilter("t", (key, lang) => {
    const entry = strings[key];
    if (!entry || entry[lang] === undefined) throw new Error(`Missing string "${key}" for "${lang}"`);
    return entry[lang];
  });

  // Content field that is either a plain string or { en, fr }.
  eleventyConfig.addFilter("loc", (value, lang) =>
    value && typeof value === "object" ? value[lang] : value
  );

  eleventyConfig.addFilter("country", (code, lang) =>
    code ? strings.countries[code][lang] : strings.unknown[lang]
  );

  eleventyConfig.addFilter("byIds", (list, wanted) =>
    (wanted || []).map((id) => list.find((item) => item.id === id)).filter(Boolean)
  );

  // Canadian owned, then open source, then European owned, then exceptions.
  eleventyConfig.addFilter("ranked", (list) => ranked(list));
  eleventyConfig.addFilter("reasons", (alt) => reasons(alt));

  // True if any French text under this key prefix awaits review.
  eleventyConfig.addFilter("frPending", (keys, prefix) =>
    keys.some((k) => k === prefix || k.startsWith(prefix + ".") || k.startsWith(prefix + "["))
  );

  // Review state at build time. The site rebuilds weekly, so this stays current.
  eleventyConfig.addFilter("review", (item, kind) =>
    reviewStatus(item, review.max_age_months[kind], review.due_soon_days)
  );

  // Link to the issue form with the entry and page filled in.
  eleventyConfig.addFilter("reportUrl", (entryName, pageUrl) => {
    const url = new URL(site.report_url);
    url.searchParams.set("title", `Out of date: ${entryName}`);
    url.searchParams.set("entry", entryName);
    url.searchParams.set("page", pageUrl);
    return url.toString();
  });

  // "@name@server" to "https://server/@name".
  eleventyConfig.addFilter("mastodonUrl", (handle) => {
    const m = /^@?([^@\s]+)@([^@\s]+)$/.exec(handle || "");
    if (!m) throw new Error(`site.mastodon must look like @name@server, got "${handle}"`);
    return `https://${m[2]}/@${m[1]}`;
  });

  eleventyConfig.addFilter("where", (list, key, value) =>
    list.filter((item) => item[key] === value)
  );

  // Dates are stored as UTC midnight, so format them in UTC.
  eleventyConfig.addFilter("longDate", (date, lang) =>
    new Intl.DateTimeFormat(`${lang}-CA`, {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    }).format(date)
  );

  eleventyConfig.addFilter("isoDate", (date) => date.toISOString().slice(0, 10));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    templateFormats: ["njk", "11ty.js"],
    htmlTemplateEngine: "njk",
  };
}
