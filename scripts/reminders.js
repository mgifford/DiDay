// Posts the monthly reminder to Mastodon on the first Sunday, and deletes
// reminders older than 30 days. Runs daily; does nothing on other days
// except the clean-up.
//
//   node scripts/reminders.js            dry run: writes reports/reminder.md
//   node scripts/reminders.js --post     posts and deletes for real
//
// Needs MASTODON_POSTING_TOKEN: a token for an application named by
// MASTODON_APP_NAME (default "First Sunday reminders") with only the
// read:statuses and write:statuses scopes.
// Gander has no public posting interface, so reports/reminder.md also holds the
// text for a person to post there by hand.
import fs from "node:fs";
import { loadCatalog } from "../lib/catalog.js";
import { parseHandle } from "../lib/mastodon.js";
import { isFirstSunday, reminderPosts, postedToday, expiredReminders, RETENTION_DAYS } from "../lib/reminders.js";

const catalog = loadCatalog();
const live = process.argv.includes("--post");
const now = new Date(process.env.REMINDER_NOW || Date.now());
const appName = process.env.MASTODON_APP_NAME || "First Sunday reminders";
const account = parseHandle(catalog.site.mastodon);
const token = process.env.MASTODON_POSTING_TOKEN;
const posts = reminderPosts(catalog);
const report = ["# Monthly reminder", "", `Run: ${now.toISOString()}`, ""];
const finish = (code = 0) => {
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync("reports/reminder.md", report.join("\n"));
  console.log(report.join("\n"));
  process.exit(code);
};

if (!posts.length) { report.push("No site url set in data/site.yaml. Nothing to post."); finish(); }

report.push("## Text", "", "Also post this on Gander by hand on the first Sunday.", "");
for (const p of posts) report.push(`### ${p.language}`, "", "```", p.status, "```", "");

if (!account || !token) { report.push("No Mastodon account or MASTODON_POSTING_TOKEN. Nothing sent."); finish(); }

const api = async (method, path, body) => {
  const res = await fetch(`https://${account.server}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": `FirstSundayReminders/0.1 (+${catalog.site.repo})`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path}: HTTP ${res.status}`);
  return res.json();
};

const me = await api("GET", "/api/v1/accounts/verify_credentials");
const own = await api("GET", `/api/v1/accounts/${me.id}/statuses?limit=40&exclude_replies=true&exclude_reblogs=true`);

// Clean-up runs every day.
const expired = expiredReminders(own, appName, now);
report.push(`## Clean-up`, "", `Reminders older than ${RETENTION_DAYS} days: ${expired.length}.`, "");
for (const s of expired) {
  if (live) await api("DELETE", `/api/v1/statuses/${s.id}`);
  report.push(`- ${live ? "deleted" : "would delete"} ${s.url} (${s.created_at})`);
}
report.push("");

// Posting only on the first Sunday, and only once.
report.push("## Posting", "");
if (!isFirstSunday(now)) report.push("Not the first Sunday. Nothing posted.");
else if (postedToday(own, appName, now)) report.push("Already posted today. Nothing posted.");
else {
  for (const p of posts) {
    if (live) {
      const s = await api("POST", "/api/v1/statuses", { status: p.status, language: p.language, visibility: "public" });
      report.push(`- posted (${p.language}): ${s.url}`);
    } else {
      report.push(`- would post (${p.language})`);
    }
  }
}
finish();
