// Link checking logic. No GitHub-specific code here, so it runs on any CI.
import fs from "node:fs";
import path from "node:path";

// Walk the YAML content and collect every http(s) URL with where it is used.
export function collectDataUrls(catalog) {
  const found = new Map();
  const walk = (value, where) => {
    if (typeof value === "string") {
      if (/^https?:\/\//.test(value)) {
        if (!found.has(value)) found.set(value, []);
        found.get(value).push(where);
      }
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, v && v.id ? `${where}.${v.id}` : `${where}[${i}]`));
    } else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) walk(v, `${where}.${k}`);
    }
  };
  for (const key of ["site", "alternatives", "cancel", "recipes", "categories"]) walk(catalog[key], key);
  return found;
}

// Statuses that usually mean "a bot was refused", not "the page is gone".
const BLOCKED = new Set([401, 403, 405, 429, 999]);

export function classify(status) {
  if (status >= 200 && status < 400) return "ok";
  if (BLOCKED.has(status)) return "blocked";
  if (status >= 500) return "server-error";
  return "broken";
}

export async function checkUrl(url, { userAgent, timeoutMs = 15000, retries = 1 } = {}) {
  let last = { status: 0, result: "unreachable", error: "" };
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const method of ["HEAD", "GET"]) {
      try {
        const res = await fetch(url, {
          method,
          redirect: "follow",
          headers: { "user-agent": userAgent, accept: "text/html,*/*" },
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (method === "GET") await res.body?.cancel();
        last = { status: res.status, result: classify(res.status), finalUrl: res.url };
        // Some servers reject HEAD; only fall through to GET if HEAD failed.
        if (last.result === "ok") return last;
      } catch (err) {
        last = { status: 0, result: "unreachable", error: err.cause?.code || err.name };
      }
    }
    if (last.result === "broken") return last; // a clear 404 needs no retry
  }
  return last;
}

export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

// Check links between pages of the built site, including #fragments.
// `pathPrefix` is the base path baked into hrefs by Eleventy (e.g. "/DiDay/"
// for a project page). Absolute hrefs carry it, but files on disk under
// `siteDir` do not, so it must be stripped before resolving to a file.
export function checkInternal(siteDir, { pathPrefix = "/" } = {}) {
  const stripPrefix = (urlPath) => {
    if (pathPrefix !== "/" && urlPath.startsWith(pathPrefix)) return "/" + urlPath.slice(pathPrefix.length);
    return urlPath;
  };

  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) files.push(full);
    }
  };
  walk(siteDir);

  const idsCache = new Map();
  const idsIn = (file) => {
    if (!idsCache.has(file)) {
      const html = fs.readFileSync(file, "utf8");
      idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
    }
    return idsCache.get(file);
  };
  const resolve = (urlPath) => {
    const clean = decodeURIComponent(urlPath);
    const candidate = path.join(siteDir, clean);
    if (clean.endsWith("/")) return path.join(candidate, "index.html");
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return path.join(candidate, "index.html");
    return candidate;
  };

  const problems = [];
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const page = "/" + path.relative(siteDir, file).replace(/index\.html$/, "");
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const ref = m[1];
      if (/^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
      const [target, fragment] = ref.split("#");
      const targetFile =
        target === "" ? file : resolve(target.startsWith("/") ? stripPrefix(target) : path.posix.join(page, target));
      if (!fs.existsSync(targetFile)) {
        problems.push({ page, ref, problem: "missing page" });
      } else if (fragment && targetFile.endsWith(".html") && !idsIn(targetFile).has(fragment)) {
        problems.push({ page, ref, problem: `no element with id "${fragment}"` });
      }
    }
  }
  return { pages: files.length, problems };
}
