// Minimal static server for testing the built site in a browser.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".ics": "text/calendar", ".js": "text/javascript" };

// `pathPrefix` is the base path baked into every href by Eleventy (e.g.
// "/DiDay/" for a project page). The built files in `dir` are never nested
// under that prefix, so it must be stripped from the request before
// resolving to a file - otherwise every asset (including the stylesheet)
// 404s and the page renders completely unstyled.
export function serve(dir, { pathPrefix = "/" } = {}) {
  const server = http.createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (pathPrefix !== "/") {
      if (!pathname.startsWith(pathPrefix)) return res.writeHead(404).end("Not found");
      pathname = "/" + pathname.slice(pathPrefix.length);
    }
    let file = path.join(dir, pathname);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!file.startsWith(dir) || !fs.existsSync(file)) return res.writeHead(404).end("Not found");
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () =>
    resolve({ url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })));
}
