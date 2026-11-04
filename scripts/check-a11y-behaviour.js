// Checks that need a browser but cannot be expressed as axe rules:
// keyboard traversal and focus visibility, the skip link, the theme toggle, the
// language switch, reflow at 320 CSS pixels, WCAG 1.4.12 text spacing, and
// forced-colours emulation.
//
//   node scripts/check-a11y-behaviour.js
//   node scripts/check-a11y-behaviour.js --browsers=firefox,chromium
//
// Writes reports/a11y-behaviour.md and exits 1 on a failure.
// This measures a few properties; it does not see the page and it is not
// assistive technology testing. Run it before launch and after layout or
// interaction changes, not on every commit: it loads every page about three
// times per browser, plus a few extras.
import fs from "node:fs";
import path from "node:path";
import { firefox, chromium } from "playwright";
import { serve } from "../lib/serve.js";

const siteDir = path.resolve("_site");
if (!fs.existsSync(siteDir)) {
  console.error("No _site folder. Run `npm run build` first.");
  process.exit(2);
}

const ENGINES = { firefox, chromium };
const arg = process.argv.find((a) => a.startsWith("--browsers="));
const BROWSERS = (arg ? arg.split("=")[1] : "firefox").split(",").map((b) => b.trim());
for (const b of BROWSERS) {
  if (!ENGINES[b]) {
    console.error(`Unknown browser "${b}". Use firefox or chromium.`);
    process.exit(2);
  }
}

const pages = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) pages.push("/" + path.relative(siteDir, full).replace(/index\.html$/, ""));
  }
};
walk(siteDir);
pages.sort();

// Must match the prefix baked into the built site's hrefs, or every asset 404s
// and the pages render unstyled. The axe script uses the same rule.
const pathPrefix = process.env.PATH_PREFIX || "/";
const withPrefix = (page) => (pathPrefix === "/" ? page : pathPrefix.replace(/\/$/, "") + page);

const failures = [];
const fail = (browser, page, check, detail) => failures.push({ browser, page, check, detail });
const report = { browsers: [], pages: pages.length, forcedColorsSkipped: [] };

// One context per check, so a change in one does not leak into another.
const contextFor = (browser, options) =>
  browser.newContext({ locale: "de-DE", ...options });

// The splash page redirects on a browser locale it recognises. de-DE above
// keeps it in place, and every check below loads pages it names explicitly.

async function checkKeyboard(browser, name) {
  const context = await contextFor(browser, { viewport: { width: 1280, height: 800 } });
  try {
    for (const page of pages) {
      const tab = await context.newPage();
      try {
        await tab.goto(server.url + withPrefix(page), { waitUntil: "load" });
        const read = () =>
          tab.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const style = getComputedStyle(el);
            return {
              tag: el.tagName.toLowerCase(),
              id: el.id,
              href: el.getAttribute("href"),
              label: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48),
              outline:
                style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2,
            };
          });

        const visit = (el) => `${el.tag}|${el.id}|${el.label}`;
        const order = [];
        await tab.evaluate(() => document.body.focus());
        for (let i = 0; i < 200; i++) {
          await tab.keyboard.press("Tab");
          const el = await read();
          if (!el) break;
          if (order.length && visit(order[0]) === visit(el)) break; // wrapped
          if (order.length && visit(order[order.length - 1]) === visit(el)) break; // left the document
          order.push(el);
        }

        if (!order.length) {
          fail(name, page, "keyboard", "no focusable element was reached");
          continue;
        }

        const hasSkip = await tab.locator("a.skip").count();
        if (hasSkip && order[0].href !== "#main") {
          fail(name, page, "keyboard", "the first Tab stop is not the skip link");
        }

        const invisible = order.filter((el) => !el.outline);
        if (invisible.length) {
          fail(name, page, "keyboard", `${invisible.length} stop(s) without a visible outline: ${invisible.slice(0, 3).map((el) => el.label || el.tag).join(", ")}`);
        }
      } finally {
        await tab.close();
      }
    }
  } finally {
    await context.close();
  }
}

async function checkOperations(browser, name) {
  const context = await contextFor(browser, { viewport: { width: 1280, height: 800 } });
  try {
    for (const page of ["/en/", "/fr/"]) {
      const tab = await context.newPage();
      try {
        await tab.goto(server.url + withPrefix(page), { waitUntil: "load" });

        // The skip link moves focus into main rather than only scrolling.
        await tab.evaluate(() => document.body.focus());
        await tab.keyboard.press("Tab");
        await tab.keyboard.press("Enter");
        const skip = await tab.evaluate(() => ({
          hash: location.hash,
          id: document.activeElement?.id || null,
        }));
        if (skip.hash !== "#main" || skip.id !== "main") {
          fail(name, page, "skip link", `hash="${skip.hash}" focused="${skip.id}"`);
        }

        // Enter on the theme toggle switches and saves the theme.
        const toggle = tab.locator("#theme-toggle");
        if ((await toggle.count()) === 0) {
          fail(name, page, "theme toggle", "no #theme-toggle on the page");
        } else {
          await toggle.focus();
          const before = await tab.evaluate(() => document.documentElement.dataset.theme);
          await tab.keyboard.press("Enter");
          const after = await tab.evaluate(() => ({
            theme: document.documentElement.dataset.theme,
            stored: localStorage.getItem("theme"),
          }));
          if (!before || !after.theme || after.theme === before || after.stored !== after.theme) {
            fail(name, page, "theme toggle", `before="${before}" after="${after.theme}" stored="${after.stored}"`);
          }
          await tab.keyboard.press("Enter"); // leave the saved theme as it was
        }

        // Enter on the language switch reaches the other language.
        const other = withPrefix(page === "/en/" ? "/fr/" : "/en/");
        const nav = tab.waitForURL((url) => url.pathname === other, { timeout: 15000 }).catch(() => null);
        await tab.locator(".lang-switch").focus();
        await tab.keyboard.press("Enter");
        await nav;
        if (new URL(tab.url()).pathname !== other) {
          fail(name, page, "language switch", `expected ${other}, landed on ${new URL(tab.url()).pathname}`);
        }
      } finally {
        await tab.close();
      }
    }
  } finally {
    await context.close();
  }
}

async function checkReflow(browser, name) {
  // 320 CSS pixels is the reflow target: 1280 wide at 400% zoom.
  const context = await contextFor(browser, { viewport: { width: 320, height: 640 } });
  try {
    for (const page of pages) {
      const tab = await context.newPage();
      try {
        await tab.goto(server.url + withPrefix(page), { waitUntil: "load" });
        const result = await tab.evaluate(() => {
          const wide = [];
          for (const el of document.querySelectorAll("body *")) {
            const style = getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") continue;
            const box = el.getBoundingClientRect();
            if (box.width === 0 && box.height === 0) continue;
            if (box.right > innerWidth + 1 || box.left < -1) {
              wide.push(`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} [${Math.round(box.left)}, ${Math.round(box.right)}]`);
            }
          }
          return { scrollWidth: document.documentElement.scrollWidth, innerWidth, wide };
        });
        if (result.scrollWidth > result.innerWidth + 1) {
          fail(name, page, "reflow", `page scrolls horizontally: ${result.scrollWidth}px wide in a ${result.innerWidth}px viewport`);
        }
        if (result.wide.length) {
          fail(name, page, "reflow", `${result.wide.length} element(s) outside the viewport: ${result.wide.slice(0, 3).join("; ")}`);
        }
      } finally {
        await tab.close();
      }
    }
  } finally {
    await context.close();
  }
}

async function checkTextSpacing(browser, name) {
  const context = await contextFor(browser, { viewport: { width: 1280, height: 800 } });
  const overrides = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important; } p, li, dd, dt { margin-bottom: 2em !important; }`;
  try {
    for (const page of pages) {
      const tab = await context.newPage();
      try {
        await tab.goto(server.url + withPrefix(page), { waitUntil: "load" });
        await tab.addStyleTag({ content: overrides });
        const result = await tab.evaluate(() => {
          const clipped = [];
          for (const el of document.querySelectorAll("body *")) {
            if (!el.textContent.trim() || el.children.length) continue;
            const style = getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") continue;
            if (["hidden", "clip"].includes(style.overflowY) && el.scrollHeight > el.clientHeight + 1) {
              clipped.push(`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}`);
            }
          }
          return { scrollWidth: document.documentElement.scrollWidth, innerWidth, clipped };
        });
        if (result.scrollWidth > result.innerWidth + 1 || result.clipped.length) {
          const detail = [
            result.scrollWidth > result.innerWidth + 1 ? "page scrolls horizontally" : "",
            result.clipped.length ? `clipped: ${result.clipped.slice(0, 3).join(", ")}` : "",
          ].filter(Boolean).join("; ");
          fail(name, page, "text spacing", detail);
        }
      } finally {
        await tab.close();
      }
    }
  } finally {
    await context.close();
  }
}

async function checkForcedColors(browser, name) {
  const context = await contextFor(browser, { viewport: { width: 1280, height: 800 }, forcedColors: "active" });
  try {
    for (const page of ["/", "/en/", "/fr/", "/en/about/", "/en/alternatives/", "/en/recipes/"]) {
      const tab = await context.newPage();
      try {
        await tab.goto(server.url + withPrefix(page), { waitUntil: "load" });
        const result = await tab.evaluate(() => {
          const link = document.querySelector("main a");
          if (!link) return { active: matchMedia("(forced-colors: active)").matches, distinguishable: null };
          const style = getComputedStyle(link);
          // A border also separates a link from the text around it, and that is
          // what the splash buttons rely on. Backgrounds are forced to Canvas,
          // so they do not count.
          const bordered = parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== "none";
          return {
            active: matchMedia("(forced-colors: active)").matches,
            distinguishable: style.textDecorationLine.includes("underline") || bordered,
          };
        });
        if (!result.active) {
          if (!report.forcedColorsSkipped.includes(name)) report.forcedColorsSkipped.push(name);
          return;
        }
        if (result.distinguishable === false) {
          fail(name, page, "forced colours", "the first link has neither an underline nor a border, so it relies on colour alone");
        }
      } finally {
        await tab.close();
      }
    }
  } finally {
    await context.close();
  }
}

const server = await serve(siteDir, { pathPrefix });
try {
  for (const name of BROWSERS) {
    const browser = await ENGINES[name].launch();
    try {
      await checkKeyboard(browser, name);
      await checkOperations(browser, name);
      await checkReflow(browser, name);
      await checkTextSpacing(browser, name);
      await checkForcedColors(browser, name);
    } finally {
      await browser.close();
    }
    report.browsers.push(name);
  }
} finally {
  server.close();
}

const lines = [
  "# Browser accessibility behaviour check",
  "",
  `Run: ${new Date().toISOString()}`,
  `Browsers: ${report.browsers.join(", ")}`,
  `Pages: ${report.pages}`,
  "",
];
if (!failures.length) {
  lines.push("No failures.", "");
} else {
  const byCheck = new Map();
  for (const f of failures) {
    if (!byCheck.has(f.check)) byCheck.set(f.check, []);
    byCheck.get(f.check).push(f);
  }
  for (const [check, list] of byCheck) {
    lines.push(`## ${check} (${list.length})`, "");
    for (const f of list) lines.push(`- ${f.browser} ${f.page}: ${f.detail}`);
    lines.push("");
  }
}
if (report.forcedColorsSkipped.length) {
  lines.push(`Forced colours: ${report.forcedColorsSkipped.join(", ")} did not report the media query as active, so that check did not run.`, "");
}
lines.push(
  "This checks a few measurable properties: focus is visible, the skip link,",
  "theme toggle and language switch work from the keyboard, nothing overflows",
  "at 320 CSS pixels or with WCAG 1.4.12 text spacing, and forced colours",
  "applies. It does not look at the page, and it is not assistive technology",
  "testing.",
  "",
);

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/a11y-behaviour.md", lines.join("\n"));
console.log(lines.join("\n"));
process.exit(failures.length ? 1 : 0);
