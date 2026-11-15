# Retrospective: phases 1–5 and the content work

Written 2026-11-15, at the end of a long build. It records what worked, the
defects that were found and what each one taught, and what Phase 6 should do
differently.

It is deliberately unflattering. The value is in the failures.

---

## State at close

| | |
| --- | --- |
| Pages built | 63 |
| Unit tests | 98 |
| Alternatives | 28 (0 dead ends remaining) |
| Recipes | 10 |
| Monthly themes | 12 |
| Global stories | 4 |
| Ecosystem records | 10 |
| axe-core, Chromium + Firefox | 0 findings, 63 pages × 6 settings |
| Behaviour check, Chromium + Firefox | 0 failures, 63 pages |
| Content verified by a person | **0** |
| French texts awaiting review | ~350 |

---

## 1. What worked

**Rules before data.** The ecosystem validator and its 22 tests were written
before `data/initiatives.yaml` existed. When the data arrived it caught two of
my own errors within a minute — `hosting` and `training` typed as categories
when they are contribution types. Writing the rules first meant the first
draft of the data failed loudly instead of quietly.

**The honesty model.** `verified: false` on every entry, "not yet reviewed" on
every card, and sources in a disclosure. It made the work slower and it is the
reason the output can be trusted at all. Nothing in this repository claims more
than it can show.

**One component, several datasets.** `.card` carries recipes, themes, events,
organizations and international entries. No new layout was needed for five
different content types.

**Tests that assert invariants, not outputs.** The ones that earned their place
check relationships in both directions (a theme shows exactly the organizations
that named it), that every record appears in exactly one group, and that every
documented pair keeps its contrast ratio.

## 2. The defects, and what each one taught

### Dark mode was silently dead (Phase 1)

Piping concatenated CSS through a Nunjucks filter HTML-escaped it:
`[data-theme="dark"]` became `[data-theme=&quot;dark&quot;]`. Every dark-mode
selector stopped matching. **Light mode looked perfect and axe passed** —
because the "dark" pages were rendering light and being measured as light.

**Lesson:** a passing accessibility check can be measuring the wrong page.
Rendering review is not optional, and the built artefact needs a test that no
HTML entity appears in it.

### A contrast failure that was not about colour (Phase 5, PR 3)

Badges could not wrap. Long French labels — "Droits numériques et capacité
communautaire" — spilled outside their card, so axe measured the text against
the wrong background and reported a contrast violation. The same overflow
scrolled the page sideways at 320px.

**Lesson:** when a contrast check fails, check layout first. Overflow can
masquerade as contrast.

### A heading with nothing under it (Phase 5, content PR)

The shop-without-Amazon recipe has no alternatives, and the template printed
"Options" unconditionally — an empty heading.

**Lesson:** new data reaches templates that assumed it would always be
non-empty. Add a conditional when a collection can be legitimately empty.

### A message that contradicted itself (same PR, found after merge)

The cancellation page said "No reviewed alternative yet. Suggest one on
GitHub." and then, three lines below, linked to a recipe for the same entry.
My check counted entries with *neither* an alternative *nor* a recipe; the
template showed the message whenever there were no *alternatives*.

**Lesson:** a data invariant and a render rule are two different things. The
test passed because it was checking the wrong predicate.

### Two scripts doing one job (Phase 1)

PR #16 was merged while Phase 1 was open, and both added a browser-behaviour
script. Shipping both would have left two commands, two reports and two places
to update. They were consolidated into #16's script, extended with the checks
it lacked.

**Lesson:** check for in-flight work on the same area before building, and
consolidate rather than keep both.

### The build failed for a reason that had nothing to do with the change

`ubuntu-latest` moved to 26.04, Playwright 1.56 has no Firefox build for it,
and every PR failed at the browser-install step before any check ran.

**Lesson:** when CI fails on every PR at once, suspect the runner, not the
code. Pin what matters.

### Watching the wrong CI run — twice

`gh run list --branch main --limit 1` returned a *previous completed* run while
the new one was still queued. Twice I reported a deploy as finished when the
new commit had not been built.

**Lesson:** match the run to the commit SHA before trusting it. The URL 404s
that followed were not defects.

### Mastodon 401 for three attempts

Two token resets changed nothing. A **freshly created application** worked
immediately.

**Lesson:** 401 means the token is invalid at the source. Deleting the
application and starting again is faster than debugging a token that will never
work.

## 3. The recurring conceptual traps

**"Canadian" usually means "operates here".** Hushmail: Vancouver office, US
parent (its own privacy policy says so). Cohere: Toronto headquarters, and
nothing states its incorporation or ownership. Both are the reason
`headquarters` and `ownership` are separate fields, and the reason a directory
listing cannot be taken at face value.

**A link check is not evidence.** A 200 proves a page exists, not that it
supports the sentence next to it. The project says this in three places and
still had to tighten five claims whose sources described something slightly
different.

**Bot walls are a verification gap, not a dead link.** CIRA, FNIGC and
`cantrusthosting.coop` all return 403 to automated requests. Those entries are
`listed`, not `documented-contributor`, and a person has to read the page.

**The French backlog grows every phase.** 140 → 265 → 326 → beyond. Every
feature adds bilingual copy. Without a reviewer it compounds, and no automated
check can substitute for reading it.

## 4. What Phase 6 should do differently

1. **Write the policy and the validator before the content.** It worked for
   the ecosystem directory; it will work for events and stories.
2. **Check the rendered page after every data change**, not only the test
   suite. Two of the four defects above passed every assertion.
3. **Assert render rules, not just data rules.** If a page shows a message
   conditionally, the test should assert what the page shows, not what the data
   contains.
4. **Review the live site after deploying**, as a step. The contradictory
   message was only visible there.
5. **Watch the navigation width.** At five top-level items the mobile header is
   three rows. A sixth needs a decision, not a discovery.
6. **Decide who verifies, before building the verification flow.** Events and
   stories both need a person; the flow is worthless without the cadence.
7. **Keep the French question open and visible.** It is the one debt that no
   amount of engineering reduces.

## 5. Open risks

| Risk | Why it matters |
| --- | --- |
| Nothing is verified | The site is honest about it, but a directory where every card says "not yet reviewed" does not yet do its job |
| French backlog | Grows with every phase; needs a fluent reviewer, not a tool |
| No manual assistive-technology testing | axe and the scripted checks are indicators, not conformance; NVDA, VoiceOver and TalkBack have never been run |
| Bot-walled sources | Three entries rest on secondary sources or an unread page |
| One maintainer | `LAUNCH.md` asks for two, one francophone; nothing here is bus-proof |
