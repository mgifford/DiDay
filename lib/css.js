// Removes CSS comments before the stylesheet is written to _site.
//
// The partials in src/_includes/css/ are heavily commented, because a comment
// explaining why a rule exists belongs next to the rule. Those comments should
// not be downloaded by every visitor: they were 35% of the stylesheet.
//
// This is a small scanner rather than a regular expression so that a comment
// marker inside a string or a url() is left alone. It does not minify
// whitespace beyond trimming trailing spaces and collapsing blank lines, so a
// rule still reads normally in the browser's inspector.

export function stripComments(css) {
  let out = "";
  let quote = null;
  let i = 0;

  while (i < css.length) {
    const char = css[i];
    const next = css[i + 1];

    if (quote) {
      out += char;
      if (char === "\\") {
        // An escaped character, including an escaped quote.
        out += next ?? "";
        i += 2;
        continue;
      }
      if (char === quote) quote = null;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      out += char;
      i += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      const end = css.indexOf("*/", i + 2);
      if (end === -1) break; // Unterminated comment: drop the rest.
      i = end + 2;
      continue;
    }

    out += char;
    i += 1;
  }

  return out
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
