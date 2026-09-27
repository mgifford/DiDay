// Minimal static server for testing the built site in a browser.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".ics": "text/calendar", ".js": "text/javascript" };

export function serve(dir) {
  const server = http.createServer((req, res) => {
    let file = path.join(dir, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!file.startsWith(dir) || !fs.existsSync(file)) return res.writeHead(404).end("Not found");
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () =>
    resolve({ url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })));
}
