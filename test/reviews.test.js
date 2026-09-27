import { test } from "node:test";
import assert from "node:assert/strict";
import { toDate, addMonths, reviewStatus } from "../lib/reviews.js";

const d = (s) => new Date(`${s}T00:00:00Z`);

test("reads dates from YAML or strings and rejects bad ones", () => {
  assert.equal(toDate("2026-03-01").toISOString().slice(0, 10), "2026-03-01");
  assert.equal(toDate(d("2026-03-01")).getUTCDate(), 1);
  assert.equal(toDate("March 2026"), null);
  assert.equal(toDate("2026-13-01"), null);
  assert.equal(toDate(undefined), null);
});

test("adding months keeps the day inside the month", () => {
  assert.equal(addMonths(d("2026-01-31"), 1).toISOString().slice(0, 10), "2026-02-28");
  assert.equal(addMonths(d("2027-08-31"), 6).toISOString().slice(0, 10), "2028-02-29");
  assert.equal(addMonths(d("2026-09-27"), 12).toISOString().slice(0, 10), "2027-09-27");
});

test("classifies review state", () => {
  const today = d("2026-09-27");
  assert.equal(reviewStatus({}, 12, 30, today).state, "never");
  assert.equal(reviewStatus({ last_reviewed: "2026-06-01" }, 12, 30, today).state, "current");
  assert.equal(reviewStatus({ last_reviewed: "2025-10-15" }, 12, 30, today).state, "due-soon");
  assert.equal(reviewStatus({ last_reviewed: "2025-09-27" }, 12, 30, today).state, "overdue");
  assert.equal(reviewStatus({ last_reviewed: "2026-03-01" }, 6, 30, today).state, "overdue");
});
