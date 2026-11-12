// The stylesheet is written to _site with its comments removed. These tests
// cover the scanner in lib/css.js, because a bug there would silently corrupt
// every page's styling.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { stripComments } from "../lib/css.js";

test("removes block comments", () => {
  assert.equal(stripComments("a{color:red}/* why */b{color:blue}"), "a{color:red}b{color:blue}");
});

test("removes a multi-line comment", () => {
  const css = "/*\n * a long note\n * over lines\n */\n.a { color: red; }";
  assert.equal(stripComments(css), ".a { color: red; }");
});

test("keeps comment markers inside strings", () => {
  assert.equal(stripComments('.a::after{content:"/* not a comment */"}'), '.a::after{content:"/* not a comment */"}');
  assert.equal(stripComments(".a{content:'*/'}"), ".a{content:'*/'}");
});

test("respects escaped quotes", () => {
  assert.equal(stripComments('.a{content:"a\\"b"}/*x*/'), '.a{content:"a\\"b"}');
});

test("keeps url() untouched", () => {
  assert.equal(stripComments(".a{background:url(/img/x.png)}"), ".a{background:url(/img/x.png)}");
});

test("drops an unterminated comment instead of leaking it", () => {
  assert.equal(stripComments(".a{color:red}/* unfinished"), ".a{color:red}");
});

test("collapses blank lines left behind", () => {
  assert.equal(stripComments("a{}\n\n\n/* x */\n\n\nb{}"), "a{}\nb{}");
});

test("the built stylesheet has no comments and keeps its rules", () => {
  const file = path.resolve(process.cwd(), "_site/css/style.css");
  if (!fs.existsSync(file)) return; // Unit tests can run before a build.
  const css = fs.readFileSync(file, "utf8");
  const body = css.replace(/^\/\*[\s\S]*?\*\//, ""); // the one-line banner
  assert.ok(!body.includes("/*"), "built stylesheet still contains a comment");
  // Nunjucks escapes {{ }} output by default. An escaped quote here turns
  // [data-theme="dark"] into a selector that never matches, which silently
  // disables the dark scheme. The stylesheet must be piped through |safe.
  for (const entity of ["&quot;", "&#39;", "&amp;", "&lt;", "&gt;"]) {
    assert.ok(!css.includes(entity), `built stylesheet contains the HTML entity ${entity}; add | safe to the template`);
  }
  for (const selector of [":root", ".wrap", ".button--primary", ".card", ".site-header"]) {
    assert.ok(css.includes(selector), `built stylesheet lost ${selector}`);
  }
});
