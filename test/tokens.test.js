// Guards the design tokens. No browser, no network: it reads the stylesheet
// source and checks the colour pairs the design system promises.
//
// Two kinds of failure are caught here:
//   1. A colour changes and a documented text or UI pair drops below WCAG 2.2
//      AA (4.5:1 for text, 3:1 for focus rings and control borders).
//   2. A styleguide swatch class loses its token, or a token is renamed
//      without updating the preview.
//
// This is a contrast check, not an accessibility test. It says nothing about
// whether the page can be used by a person.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (p) => fs.readFileSync(path.resolve(process.cwd(), p), "utf8");
const CSS_DIR = "src/_includes/css";
const tokensCss = read(`${CSS_DIR}/tokens.css`);
const componentsCss = read(`${CSS_DIR}/components.css`);

// ---------------------------------------------------------------- colour math

function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a six-digit hex colour: ${hex}`);
  const n = m[1];
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(n.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ------------------------------------------------------------ token parsing

// Declarations inside blocks whose selector is exactly `:root`. The dark
// media block's selector is `:root:not(...)`, so it is not matched here.
function declarations(css, selectorPattern) {
  const out = {};
  for (const match of css.matchAll(selectorPattern)) {
    for (const line of match[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      out[line[1]] = line[2].trim();
    }
  }
  return out;
}

const base = declarations(tokensCss, /(?:^|\n):root\s*\{([\s\S]*?)\}/g);
const explicitDark = declarations(tokensCss, /:root\[data-theme="dark"\]\s*\{([\s\S]*?)\}/g);
const systemDark = declarations(tokensCss, /:root:not\(\[data-theme="light"\]\)\s*\{([\s\S]*?)\}/g);

// Resolve `var(--x)` chains down to a hex value.
function resolve(map, name, depth = 0) {
  if (depth > 10) throw new Error(`var() cycle or nesting too deep at ${name}`);
  const value = map[name];
  if (value === undefined) throw new Error(`Unknown token ${name}`);
  const ref = /^var\((--[a-z0-9-]+)\)$/i.exec(value);
  return ref ? resolve(map, ref[1], depth + 1) : value;
}

const schemes = {
  light: base,
  dark: { ...base, ...systemDark },
  "dark (toggle)": { ...base, ...explicitDark },
};

test("the three colour schemes declare the same semantic tokens", () => {
  const expected = Object.keys(base).filter((k) => !k.startsWith("--c-") && !k.startsWith("--font") && !k.startsWith("--text") && !k.startsWith("--leading") && !k.startsWith("--weight") && !k.startsWith("--space") && !k.startsWith("--measure") && !k.startsWith("--radius") && !k.startsWith("--shadow") && !k.startsWith("--border") && !k.startsWith("--focus") && !k.startsWith("--tap") && !k.startsWith("--transition"));
  for (const [name, map] of Object.entries(schemes)) {
    for (const token of expected) {
      assert.ok(map[token] !== undefined, `${name}: missing ${token}`);
    }
  }
  // The toggle's dark block and the system dark block must agree.
  for (const token of Object.keys(explicitDark)) {
    assert.equal(explicitDark[token], systemDark[token], `${token} differs between the two dark blocks`);
  }
});

// Text pairs need 4.5:1. UI boundaries and focus rings need 3:1.
const TEXT_PAIRS = [
  ["ink", "paper"], ["muted", "paper"], ["brand", "paper"], ["accent", "paper"],
  ["forest", "paper"], ["danger", "paper"],
  ["ink", "surface"], ["muted", "surface"], ["brand", "surface"], ["accent", "surface"],
  ["forest", "surface"], ["danger", "surface"],
  ["on-brand", "brand"], ["on-accent", "accent"],
];

const UI_PAIRS = [
  ["focus", "paper"], ["focus", "surface"],
  ["rule-control", "paper"], ["brand", "paper"],
];

for (const [scheme, map] of Object.entries(schemes)) {
  test(`${scheme}: text meets 4.5:1`, () => {
    for (const [fg, bg] of TEXT_PAIRS) {
      const ratio = contrast(resolve(map, `--${fg}`), resolve(map, `--${bg}`));
      assert.ok(
        ratio >= 4.5,
        `${scheme}: --${fg} on --${bg} is ${ratio.toFixed(2)}:1, needs 4.5:1`
      );
    }
  });

  test(`${scheme}: UI boundaries and focus meet 3:1`, () => {
    for (const [fg, bg] of UI_PAIRS) {
      const ratio = contrast(resolve(map, `--${fg}`), resolve(map, `--${bg}`));
      assert.ok(
        ratio >= 3,
        `${scheme}: --${fg} on --${bg} is ${ratio.toFixed(2)}:1, needs 3:1`
      );
    }
  });
}

// The dark scheme turns shadows off, so a card there separates by colour
// only. The light scheme keeps shadows and a border, so its surfaces do not
// need a large luminance gap, but they must still be lighter than the page.
test("surfaces separate from the page background in both schemes", () => {
  for (const scheme of ["dark", "dark (toggle)"]) {
    const map = schemes[scheme];
    const ratio = contrast(resolve(map, "--surface"), resolve(map, "--paper"));
    assert.ok(ratio >= 1.15, `${scheme}: --surface is only ${ratio.toFixed(2)}:1 from --paper`);
  }
  assert.ok(
    luminance(resolve(base, "--surface")) > luminance(resolve(base, "--paper")),
    "light: --surface should be lighter than --paper"
  );
});

test("shadows are switched off in the dark scheme", () => {
  assert.equal(explicitDark["--shadow-card"], "none");
  assert.equal(systemDark["--shadow-card"], "none");
  assert.notEqual(base["--shadow-card"], "none");
});

// ------------------------------------------------------- styleguide preview

test("every styleguide swatch references a real token", () => {
  const swatches = [...componentsCss.matchAll(/\.swatch--([a-z0-9-]+)\s*\{\s*background:\s*var\((--[a-z0-9-]+)\)/gi)];
  assert.ok(swatches.length > 0, "no swatch classes found");
  for (const [, name, ref] of swatches) {
    assert.equal(ref, `--${name}`, `.swatch--${name} should reference --${name}, not ${ref}`);
    assert.ok(base[`--${name}`] !== undefined, `.swatch--${name} has no --${name} token`);
  }
});
