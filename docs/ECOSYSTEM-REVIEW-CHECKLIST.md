# Canadian ecosystem directory: review checklist

Status: **phase 5, PR 5.** This is the human half of the verification. The
machine half already runs on every build; this page lists only what a person
has to do, and what it changes when they do it.

Context: [research inventory](ECOSYSTEM-RESEARCH.md) ·
[editorial policy](ECOSYSTEM-EDITORIAL-POLICY.md) ·
[record schema](ECOSYSTEM-SCHEMA.md).

---

## What is already checked automatically

Do not spend review time on these; the build fails if they break.

| Check | Where |
| --- | --- |
| Every record passes the schema rules | `lib/initiatives.js`, run by `scripts/validate.js` |
| Every contribution has a source; every source is `https://` | same |
| Both languages present for summary, contributions and rationales | same |
| Every `relationships.themes` id exists and is shown on that theme | `test/initiatives.test.js` |
| Every record appears in exactly one directory group | `test/initiatives.test.js` |
| No duplicate ids, no entries missing from the page | same |
| Featured entries have a rationale and `documented-contributor` status | same |
| Pages meet WCAG 2.2 AA automated checks, both languages, both themes | `npm run check:a11y` |
| Keyboard, focus, reflow, text spacing, forced colours, reduced motion | `npm run check:a11y:behaviour` |

What none of that does is read a source and decide whether it supports the
sentence next to it. **That is the review.**

## Per record

1. Open the record in `data/initiatives.yaml`.
2. Open **every** URL under `sources` and under `contributions[].sources`.
3. For each contribution, check the claim against the page:
   - Does the page name this organization?
   - Does it describe the work claimed, at that scale?
   - Is the licence stated, if the claim names one?
4. If the claim holds, set:
   ```yaml
   verified: true
   last_reviewed: 2026-11-13   # the date you checked it
   ```
5. If it does not hold, **change the claim to match the source**, or remove
   the contribution and set the record to `listed`. Do not leave a claim that
   reads well but is not supported.

A successful HTTP request is not review. Every URL below returned 200 on
2026-11-13 except the two marked, and that says nothing about whether the page
supports the claim.

## The two records that cannot be verified by machine

Both block automated requests (HTTP 403), so the researcher could not read
them. Both are recorded as `listed`, not `documented-contributor`.

| Record | URL to open | What to confirm |
| --- | --- | --- |
| `cira` | <https://www.cira.ca/en/> | That CIRA operates the `.ca` registry and runs a community investment programme funding Canadian internet projects. |
| `fnigc` | <https://fnigc.ca/> | That FNIGC publishes and teaches the OCAP® principles. Describe it in FNIGC's own terms; do not reframe it as general open-data work. |

If confirmed: set `status: documented-contributor` and add
`verified: true` + `last_reviewed`.

## French review

The site's review system tracks every bilingual pair in
`data/translations.lock.yaml`. The directory adds:

- 12 interface strings (`canada_*`, `not_reviewed`, `home_canada_cta`, …);
- 10 summaries and 10 contribution descriptions;
- 2 featured rationales;
- 5 items in the "five things that are not the same" list.

Run `npm run french` for the current list, then approve pairs with
`npm run french -- approve <key>` once a fluent reviewer has read them.

Two consistency points worth a reviewer's attention:

- the site's existing label for open source is **"code source ouvert"**; the
  new prose uses **"logiciel libre"** in several places, which is the more
  natural French but is not the term the rest of the site uses;
- French typography: non-breaking space before `:` `;` `!` `?` and inside
  « », and no space before a comma.

Neither is an error a build can catch.

## Cadence

- Review window is 12 months (`data/review.yaml`). `scripts/check-reviews.js`
  flags overdue records, and the monthly workflow opens an issue.
- Re-check a record sooner if the organization changes hands, the repository
  is archived, or the licence changes.

## Sign-off

Record who verified what and when. This table is the audit trail; the
`verified` flags in the data are the machine-readable form of the same fact.

| Date | Reviewer | Records verified | French reviewed | Notes |
| --- | --- | --- | --- | --- |
| — | — | none yet | no | All ten records ship as `verified: false`, which the page states on every card. |
