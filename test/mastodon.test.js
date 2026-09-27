import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHandle, publicMentions, htmlToText, neutralize, matchEntries, toIssue } from "../lib/mastodon.js";

const catalog = {
  alternatives: [{ id: "kobo", name: "Kobo" }, { id: "public-library", name: { en: "Your public library", fr: "Votre bibliothèque publique" } }],
  cancel: [{ id: "kindle-unlimited", service: "Kindle Unlimited" }],
  recipes: [{ id: "email-without-google", title: { en: "Email without Gmail", fr: "Le courriel sans Gmail" } }],
};
const status = (visibility, content, extra = {}) => ({
  visibility, content, url: "https://mstdn.ca/@reader/1", account: { acct: "reader@example.social" }, ...extra,
});

test("parses a Mastodon handle", () => {
  assert.deepEqual(parseHandle("@firstsunday@mstdn.ca"), { user: "firstsunday", server: "mstdn.ca" });
  assert.equal(parseHandle("firstsunday"), null);
});

test("keeps only public mentions", () => {
  const n = [
    { type: "mention", status: status("public", "a") },
    { type: "mention", status: status("unlisted", "b") },
    { type: "mention", status: status("private", "c") },
    { type: "mention", status: status("direct", "d") },
    { type: "favourite", status: status("public", "e") },
  ];
  assert.deepEqual(publicMentions(n).map((x) => x.status.content), ["a"]);
});

test("converts post HTML to text", () => {
  assert.equal(htmlToText('<p><span class="h-card">@firstsunday</span> Kobo link is broken &amp; old</p><p>second</p>'),
    "@firstsunday Kobo link is broken & old\n\nsecond");
});

test("stops mentions and issue references from pinging on GitHub", () => {
  assert.equal(neutralize("@octocat see #12"), "@\u200boctocat see #\u200b12");
});

test("finds entries named in either language", () => {
  assert.deepEqual(matchEntries("Votre bibliothèque publique et Kindle Unlimited", catalog),
    ["alternatives.public-library", "cancel.kindle-unlimited"]);
});

test("builds an issue with the post link and no live mentions", () => {
  const issue = toIssue(status("public", "<p>@firstsunday The Kobo page is out of date</p>"), catalog);
  assert.equal(issue.title, "Report from Mastodon: The Kobo page is out of date");
  assert.ok(issue.body.includes("Original post: https://mstdn.ca/@reader/1"));
  assert.ok(issue.body.includes("`alternatives.kobo`"));
  assert.ok(!issue.body.includes("@firstsunday"));
  assert.ok(issue.body.includes("@\u200bfirstsunday"));
});
