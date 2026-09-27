import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { classify, checkUrl, checkInternal, collectDataUrls } from "../lib/links.js";

let server;
let base;
before(async () => {
  server = http.createServer((req, res) => {
    const routes = {
      "/ok": 200, "/gone": 404, "/bot-wall": 403,
    };
    if (req.url === "/no-head") return res.writeHead(req.method === "HEAD" ? 405 : 200).end();
    if (req.url === "/moved") return res.writeHead(301, { location: "/ok" }).end();
    res.writeHead(routes[req.url] ?? 500).end();
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test("classifies status codes", () => {
  assert.equal(classify(200), "ok");
  assert.equal(classify(404), "broken");
  assert.equal(classify(403), "blocked");
  assert.equal(classify(429), "blocked");
  assert.equal(classify(503), "server-error");
});

test("checks live URLs", async () => {
  const opts = { userAgent: "test", retries: 0 };
  assert.equal((await checkUrl(`${base}/ok`, opts)).result, "ok");
  assert.equal((await checkUrl(`${base}/moved`, opts)).result, "ok");
  assert.equal((await checkUrl(`${base}/gone`, opts)).result, "broken");
  assert.equal((await checkUrl(`${base}/bot-wall`, opts)).result, "blocked");
  assert.equal((await checkUrl(`${base}/no-head`, opts)).result, "ok");
  assert.equal((await checkUrl("http://127.0.0.1:1/", opts)).result, "unreachable");
});

test("finds missing pages and fragments in the built site", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "site-"));
  fs.mkdirSync(path.join(dir, "en"));
  fs.writeFileSync(path.join(dir, "en", "index.html"),
    '<a href="/en/">self</a><a href="/en/#top">top</a><a href="/en/#nope">bad</a><a href="/fr/">missing</a><a href="https://x.test">ext</a><h1 id="top">x</h1>');
  const { problems } = checkInternal(dir);
  assert.deepEqual(problems.map((p) => p.ref).sort(), ["/en/#nope", "/fr/"]);
});

test("resolves prefixed hrefs against the unprefixed build output", () => {
  // Eleventy bakes pathPrefix into every absolute href (e.g. "/DiDay/en/"),
  // but the files it writes to `_site` are never nested under that prefix.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "site-"));
  fs.mkdirSync(path.join(dir, "en"));
  fs.writeFileSync(path.join(dir, "en", "index.html"),
    '<a href="/DiDay/en/">self</a><a href="/DiDay/fr/">missing</a><a href="/DiDay/en/#top">top</a><h1 id="top">x</h1>');
  const { problems } = checkInternal(dir, { pathPrefix: "/DiDay/" });
  assert.deepEqual(problems.map((p) => p.ref).sort(), ["/DiDay/fr/"]);
});

test("records where each URL is used", () => {
  const urls = collectDataUrls({
    site: { repo: "https://example.org/repo" },
    alternatives: [{ id: "a", sources: [{ url: "https://example.org/s" }] }],
    cancel: [{ id: "c", cancel_url: "https://example.org/s" }],
    recipes: [], categories: [],
  });
  assert.deepEqual(urls.get("https://example.org/s"), ["alternatives.a.sources[0].url", "cancel.c.cancel_url"]);
});
