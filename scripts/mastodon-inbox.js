// Reads public mentions of the project's Mastodon account and opens an issue
// for each one not already filed.
//
//   node scripts/mastodon-inbox.js           dry run: writes reports/mastodon.md
//   node scripts/mastodon-inbox.js --create  also opens issues (needs gh and GH_TOKEN)
//
// Needs MASTODON_TOKEN: an access token for the project account with only the
// read:notifications scope. It never posts, replies or dismisses notifications.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { loadCatalog } from "../lib/catalog.js";
import { parseHandle, publicMentions, toIssue } from "../lib/mastodon.js";

const catalog = loadCatalog();
const create = process.argv.includes("--create");
const account = parseHandle(catalog.site.mastodon);

if (!account) {
  console.log("No Mastodon account set in data/site.yaml. Nothing to do.");
  process.exit(0);
}
if (!process.env.MASTODON_TOKEN) {
  console.log("MASTODON_TOKEN is not set. Nothing to do.");
  process.exit(0);
}

const url = new URL(`https://${account.server}/api/v1/notifications`);
url.searchParams.append("types[]", "mention");
url.searchParams.set("limit", "40");
const res = await fetch(url, {
  headers: {
    authorization: `Bearer ${process.env.MASTODON_TOKEN}`,
    "user-agent": `FirstSundayMastodonInbox/0.1 (+${catalog.site.repo})`,
  },
});
if (!res.ok) {
  console.error(`Mastodon returned HTTP ${res.status}`);
  process.exit(1);
}
const notifications = await res.json();
const mentions = publicMentions(notifications);
const issues = mentions.map((n) => toIssue(n.status, catalog));

// GitHub-specific part. On Codeberg, replace these two functions with Forgejo API calls.
const alreadyFiled = (postUrl) =>
  execFileSync("gh", ["issue", "list", "--state", "all", "--search", `"${postUrl}" in:body`, "--json", "number", "--jq", "length"])
    .toString().trim() !== "0";
const openIssue = (issue) => {
  fs.writeFileSync("reports/issue-body.md", issue.body);
  execFileSync("gh", ["issue", "create", "--title", issue.title, "--body-file", "reports/issue-body.md"], { stdio: "inherit" });
};

fs.mkdirSync("reports", { recursive: true });
const lines = ["# Mastodon inbox", "", `Run: ${new Date().toISOString()}`, "",
  `Mentions fetched: ${notifications.length}. Public mentions: ${mentions.length}. Others skipped.`, ""];
for (const issue of issues) {
  let state = "dry run";
  if (create) {
    if (alreadyFiled(issue.url)) state = "already filed";
    else { openIssue(issue); state = "issue opened"; }
  }
  lines.push(`## ${issue.title} (${state})`, "", issue.body, "");
}
fs.writeFileSync("reports/mastodon.md", lines.join("\n"));
console.log(lines.join("\n"));
