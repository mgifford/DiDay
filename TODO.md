# TODO

Working list for this repository. The phase documents live in `docs/`; this
file is the short version of what is decided, what is next, and what is
blocked.

Last updated: 2026-11-15.

---

## Phase 6: participation — **on hold**

Not started, by decision of the maintainer on 2026-11-15. The three earlier
items (Mastodon tokens, the cancellation dead ends, and the Canadian ecosystem
directory) were finished first. This section exists so the phase does not have
to be re-derived when it is picked up.

### What it is meant to do

Turn the site from something people read into something people can act with,
for four audiences:

1. **Individuals** — find a manageable action, try it, and optionally say how
   it went.
2. **Community organizers** — find what they need to run a switching session
   or a DI.DAY event.
3. **Open-source contributors** — correct content, improve documentation,
   translate, review software.
4. **Canadian organizations** — provide verified descriptions of their work
   and advertise local activities.

### Constraints that do not change

- No accounts, no registration service, no database, no server.
- No trackers, cookies, analytics or third-party scripts.
- English and French are equal; the build fails if either is missing.
- WCAG 2.2 AA, and the work functions without JavaScript.
- Events link to the organizer's own page; this site does not take bookings.
- **Consent is required for stories.** A public Mastodon mention is not
  permission to republish someone's name or experience, and the site already
  says so on the About page.
- No invented impact statistics, counters or testimonials.

### Proposed PR sequence

| PR | Contents | Depends on |
| --- | --- | --- |
| 6.1 Research and policy | Events verification policy, story consent policy, metrics definitions, organizer toolkit inventory | the IA decision below |
| 6.2 Events data model | `data/events.yaml` + validator + tests, no pages | 6.1 |
| 6.3 Organizer toolkit | Bilingual event description, 60-minute agenda, accessible event guidance, printable poster, social text — as editable source files | 6.1 |
| 6.4 Events and stories pages | `/events/` and the story route, server-rendered | 6.2, 6.3 |
| 6.5 Impact reporting | Only what can be counted honestly, with definitions | 6.4 |

### Decisions needed before 6.1

1. **"Get involved" vs "Canada".** Still open from
   `docs/INFORMATION-ARCHITECTURE.md`. Organizing is national; the
   organization directory is Canadian. Both phases want "who is doing this".
2. **Navigation.** A sixth top-level item fits; a seventh does not. Does
   "Get involved" replace a grouping or add one?
3. **Who verifies an event?** Every event needs an organizer, a date with a
   timezone, an accessibility status (or an explicit "unknown"), and a source.
   That is a human task with a cadence.
4. **Where is consent recorded?** If a story is published, the record of
   permission must live somewhere that is not the public page.
5. **What do the metrics mean?** "Self-reported completed switch" and
   "attempted switch" are different numbers, and neither is verifiable. The
   definition has to exist before the first number is shown.

### What not to build

- A registration system, accounts, RSVP handling, or a comment feed.
- A participation counter, a map of "people who joined", or anything that
  implies surveillance of participants.
- A second content pipeline: extend `scripts/validate.js` and
  `data/review.yaml`, do not add another.

---

## Content backlog

| Item | Why it matters |
| --- | --- |
| **Browser alternatives and a browser recipe** | The site has none, and a real Mastodon report arrived on 2026-11-15 describing exactly this switch (Chrome tabs to Firefox with containers). The "Choose an open browser" theme was deferred in Phase 3 for this reason. |
| **Canadian co-ops** | `cantrusthosting.coop` blocks automated requests, so it needs a person. `bcca.coop` is a co-op association and a good directory lead. |
| **B Corporations** | `bcorpdirectory.ca` is the Canadian B Corp directory. See the policy note in `CONTRIBUTING.md`: certification is a legitimate *exception reason* for a US-owned service, not a ranking. |
| **Audiobooks** | Still no Canadian-owned option; library lending is the honest answer. |
| **Crave** | Canadian-owned (Bell Media) but no source line yet. |

## Verification backlog

The largest outstanding liability, and it grows with every content PR.

| Item | Count |
| --- | --- |
| French texts awaiting review | 326+ before the video/office/AI content; more now |
| Content entries marked `verified: false` | all alternatives, recipes, themes, global stories and initiatives |
| Directory records needing a person | CIRA, FNIGC (both block automated requests) |
| Manual assistive-technology testing | none yet: NVDA, VoiceOver, TalkBack, Windows forced colours |

## Operational

| Item | State |
| --- | --- |
| `MSTDN` (reminder posting) | Working, verified 2026-11-13 |
| `MASTODON_TOKEN` (inbox) | Working, verified 2026-11-15; created issues #32 and #33 |
| Mastodon bot policy, profile, author attribution | Still unchecked in `LAUNCH.md` |
| Maintainers named | None yet; `LAUNCH.md` asks for two, one francophone |
