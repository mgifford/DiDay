// Turns public Mastodon mentions of the project account into issue drafts.
// Only posts with visibility "public" are used. Unlisted, followers-only and
// direct messages are never copied, because their authors did not publish them openly.

export function parseHandle(handle) {
  const m = /^@?([^@\s]+)@([^@\s]+)$/.exec(handle || "");
  return m ? { user: m[1], server: m[2] } : null;
}

export function publicMentions(notifications) {
  return notifications.filter(
    (n) => n.type === "mention" && n.status && n.status.visibility === "public" && !n.status.reblog
  );
}

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " " };

export function htmlToText(html) {
  return (html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (e) => ENTITIES[e])
    .trim();
}

// Stop "@name" and "#123" in a quoted post from pinging GitHub users or linking issues.
export function neutralize(text) {
  return text.replace(/@/g, "@\u200b").replace(/#(\d)/g, "#\u200b$1");
}

// Entries whose name or id appears in the post, to help whoever triages it.
export function matchEntries(text, catalog) {
  const lower = text.toLowerCase();
  const names = (v) => (typeof v === "string" ? [v] : v ? Object.values(v) : []);
  const found = [];
  const check = (kind, id, candidates) => {
    if ([id, ...candidates].some((c) => c && c.length > 2 && lower.includes(c.toLowerCase()))) {
      found.push(`${kind}.${id}`);
    }
  };
  for (const a of catalog.alternatives) check("alternatives", a.id, names(a.name));
  for (const x of catalog.cancel) check("cancel", x.id, [x.service]);
  for (const r of catalog.recipes) check("recipes", r.id, names(r.title));
  return found;
}

export function toIssue(status, catalog) {
  const text = htmlToText(status.content);
  const firstLine = text.split("\n")[0].replace(/^(@\S+\s+)+/, "").slice(0, 60);
  const matches = matchEntries(text, catalog);
  const quoted = neutralize(text).split("\n").map((l) => `> ${l}`).join("\n");
  const body = [
    `Reported on Mastodon by \`@${status.account.acct}\`.`,
    ``,
    `Original post: ${status.url}`,
    ``,
    quoted,
    ``,
    matches.length ? `Possible entries: ${matches.map((m) => `\`${m}\``).join(", ")}` : `No entry recognised. Check the post.`,
    ``,
    `This was a public post. To follow up, reply to it on Mastodon.`,
  ].join("\n");
  return { title: `Report from Mastodon: ${firstLine || "(no text)"}`, body, url: status.url };
}
