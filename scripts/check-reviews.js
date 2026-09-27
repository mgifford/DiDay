// Lists content by review status. Writes reports/reviews.md.
// Exits 1 if any review has expired. Entries never reviewed are listed but
// do not fail the run, so unreviewed sample data does not open an issue every week.
import fs from "node:fs";
import { loadCatalog } from "../lib/catalog.js";
import { allReviews } from "../lib/reviews.js";

const catalog = loadCatalog();
const rows = allReviews(catalog);
const iso = (d) => d.toISOString().slice(0, 10);

const lines = ["# Review dates", "", `Run: ${new Date().toISOString()}`, "",
  `Reviews last ${Object.entries(catalog.review.max_age_months).map(([k, v]) => `${v} months for ${k}`).join(", ")}.`, ""];
const section = (state, title, note) => {
  const list = rows.filter((r) => r.state === state).sort((a, b) => (a.due ?? 0) - (b.due ?? 0));
  lines.push(`## ${title} (${list.length})`, "");
  if (note) lines.push(note, "");
  for (const r of list) {
    const when = r.reviewed ? ` (reviewed ${iso(r.reviewed)}, due ${iso(r.due)})` : "";
    lines.push(`- \`${r.key}\`${when}`);
  }
  lines.push("");
};
section("overdue", "Overdue", "Check the sources, update the entry, then set last_reviewed and verified: true.");
section("due-soon", "Due within " + catalog.review.due_soon_days + " days");
section("never", "Never reviewed");
section("current", "Current");

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/reviews.md", lines.join("\n"));
console.log(lines.join("\n"));
process.exit(rows.some((r) => r.state === "overdue") ? 1 : 0);
