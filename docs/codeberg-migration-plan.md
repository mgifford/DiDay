# Moving to Codeberg, with GitHub as a mirror

Status: **planning only**. Nothing here has been started. This document
explains what's possible, what each piece requires, and the tradeoffs, so a
decision can be made before any of it is done.

Goal, as stated: Codeberg becomes the canonical/primary home of this
project. GitHub keeps a copy — commits, and ideally the live site too — so
the project stays discoverable where people already look (the "toe-hold"),
without depending on GitHub for anything that matters.

## 1. What moves easily, with no code changes

This project is already built to make this easy — the principle is stated
directly in `README.md`: *"Static HTML only, so the site can move from
GitHub Pages to Codeberg Pages or any other host without code changes."*
That holds up. The things that move cleanly:

- **The code itself.** Codeberg has a built-in **migration tool**
  (`+` → `New Migration` → GitHub) that clones the repository, and can
  optionally bring over issues, labels, milestones and releases (not the
  wiki, since this repo doesn't use one). This is a one-time action, not
  ongoing sync.
- **The build.** `npm run build` produces plain HTML/CSS/JS in `_site/`.
  Nothing in this repo depends on a GitHub-specific service to build —
  `scripts/validate.js`, `eleventy`, `html-validate`, the link checker and
  the accessibility checker are all plain Node scripts that run anywhere.
- **The domain.** `diday.ca` is just DNS. Whichever host serves the *built*
  site is the one the domain points at; moving hosts means repointing DNS
  and updating the `CNAME`-equivalent file, not touching application code.

## 2. What needs a decision: where does CI/CD run?

This is the part that isn't a clean swap, because **Codeberg's CI model is
different from GitHub's**, and this repo currently relies on GitHub
Actions for five separate jobs: build+deploy, weekly link/ownership/a11y
checks, monthly review-date checks, the daily Mastodon inbox, and the
monthly reminder poster.

Codeberg offers two different CI paths, and neither is a drop-in
equivalent of "push code, Actions just runs":

### Option A: Forgejo Actions (GitHub Actions-workalike syntax)

Forgejo Actions uses YAML workflows very close to GitHub Actions syntax —
much of `.github/workflows/*.yml` could likely be reused with only minor
adjustments (action references use `https://codeberg.org/...` URLs instead
of `actions/...`, and some context variables differ, e.g. `forge.token`
instead of `github.token`).

**The catch:** Codeberg does not provide free hosted Actions runners for
general use. Per Codeberg's own docs, hosted Actions are offered "in
limited fashion" due to security and maintainer bus-factor concerns. To
use Forgejo Actions here, you'd need to **run your own runner** — it can
be a small machine at home (no public IP needed; it connects out to
Codeberg and waits for jobs), but it is infrastructure you would own and
keep running, unlike GitHub's free hosted minutes.

### Option B: Woodpecker CI (Codeberg's hosted option)

Codeberg does host a free Woodpecker CI instance (`ci.codeberg.org`), and
this is the option their own docs point to for people who want hosted CI
without running a runner.

**The catch:** onboarding is **manual and gated** — you fill out a request
form, and a Codeberg volunteer reviews and approves it based on published
criteria (to prevent abuse of limited shared resources). It's not
instantly self-serve the way enabling GitHub Actions is. Woodpecker's
config format is also its own thing (`.woodpecker.yml`), not a GitHub
Actions syntax match, so the workflow files would need to be rewritten,
not just tweaked. Woodpecker also only builds on `linux/amd64`.

### Option C: Push a pre-built `_site/` and skip CI-driven builds entirely

Codeberg Pages' simplest path doesn't require CI at all: publish a
`pages` branch containing the built `_site/` output, and a webhook
auto-publishes it on every push to that branch. This sidesteps the whole
CI question for **the site deploy specifically**, but doesn't help with
the other four scheduled jobs (link checks, a11y checks, review-date
checks, Mastodon automation), which need *something* to run them on a
schedule regardless of where the site itself is hosted.

### What this means in practice

The site (Pages) and the automation (scheduled jobs) can be decided
**separately**, and don't have to move together:

| Piece | Can move to Codeberg cleanly? | Needs |
|---|---|---|
| Site deploy (Pages) | Yes, via Forgejo Actions *or* a pushed `pages` branch | A runner (Actions) or nothing extra (branch push) |
| Scheduled checks (links, a11y, reviews) | Yes, but needs real CI | A runner, or approved Woodpecker access |
| Mastodon inbox / reminders | Yes, same as above | Same as above |
| Keeping GitHub as a live mirror | Yes, automatically | Codeberg's built-in push mirror |

A reasonable middle path: keep GitHub Actions running the scheduled jobs
and the GitHub Pages deploy exactly as now (nothing to change), while
Codeberg becomes canonical for *code* via the push mirror, and Codeberg
Pages is set up as a **second** live copy of the site once a CI answer
(runner or Woodpecker approval) is settled. Nothing forces an all-or-
nothing cutover.

## 3. The "GitHub as toe-hold" mirror

Codeberg has a built-in feature for exactly this: **Settings → Repository
→ Mirror Settings → Push Mirror**, from inside the Codeberg repo, once it
exists there. You give it:

- The GitHub repo's URL (a GitHub repo must already exist to push to).
- A GitHub **Personal Access Token** with just enough scope to push to
  that one repo (not your whole GitHub account).
- "Sync when new commits are pushed" — so every push to Codeberg
  automatically propagates to GitHub, no separate action needed.

**What it does and doesn't sync:** commits, branches and tags — yes.
Issues, pull requests, releases and any wiki — no, those stay on
whichever side they were opened on. For a toe-hold whose job is
discoverability and a working `git clone`, that's likely enough; it's
worth knowing up front rather than assuming full parity.

This is the *reverse* direction of the migration tool in §1 — the
migration tool is a one-time GitHub→Codeberg copy to get started; the push
mirror is the ongoing Codeberg→GitHub sync to keep after that.

## 4. GitHub Pages today vs. after

Right now, `diday.ca` → GitHub Pages, via `.github/workflows/pages.yml`
and the `CNAME` file this session added (`src/CNAME`, copied into
`_site/`). If Codeberg Pages becomes canonical instead:

- `diday.ca`'s DNS moves to point at Codeberg Pages (a CNAME/ALIAS record
  to `codeberg.page`, or A/AAAA records — same shape of change as any
  host migration, documented in Codeberg's custom-domain guide).
- A domain can only really point at one place's Pages service at a time
  for the *same* hostname — you can't have `diday.ca` live on both GitHub
  Pages and Codeberg Pages simultaneously. If keeping a working GitHub
  Pages copy matters (not just a mirrored repo, but an actually-visitable
  fallback site), that would need a different, non-custom address on the
  GitHub side, e.g. the default `mgifford.github.io/DiDay/` URL, left
  running alongside `diday.ca` on Codeberg.

## 5. Suggested order, if this goes ahead later

Not a commitment to any of this — just the order that avoids downtime or
losing content, if and when the decision is made:

1. Migrate the repo to Codeberg (§1), including issues if wanted.
2. Set up the GitHub push mirror (§3) so Codeberg is immediately the
   source of truth with GitHub already staying in sync.
3. Decide the CI path (§2: self-hosted runner, or apply for Woodpecker
   access) — this can take a while if Woodpecker approval is the route,
   so start this early rather than last.
4. Get Codeberg Pages serving the site at *some* address first (its free
   `*.codeberg.page` subdomain), fully verified, before touching DNS.
5. Only then repoint `diday.ca`'s DNS to Codeberg Pages, and decide
   whether to keep a GitHub Pages fallback at a non-custom address.
6. Once Codeberg is confirmed working end to end, decide whether GitHub
   Actions' scheduled jobs (checks, reminders, inbox) get turned off in
   favour of the Codeberg-side equivalents, or kept running in parallel
   as a redundancy — since the push mirror keeps GitHub's copy of the code
   current either way, GitHub Actions could keep running against it
   indefinitely if that redundancy is wanted.

## Open questions for whoever starts this

- Self-hosted Forgejo runner, or apply for Woodpecker access? Affects the
  whole timeline (§2 is the long pole).
- Keep the Mastodon/Gander automation on GitHub Actions permanently
  (since it doesn't touch the site's hosting at all), even after Codeberg
  becomes canonical for code and Pages?
- Is a GitHub Pages fallback at `mgifford.github.io/DiDay/` worth keeping
  once `diday.ca` moves to Codeberg, or is the mirrored *code* enough of a
  toe-hold on its own?

## Sources

- <https://docs.codeberg.org/codeberg-pages/>
- <https://docs.codeberg.org/codeberg-pages/forgejo-actions/>
- <https://docs.codeberg.org/codeberg-pages/using-custom-domain/>
- <https://docs.codeberg.org/ci/>
- <https://docs.codeberg.org/ci/actions/>
- <https://docs.codeberg.org/advanced/migrating-repos/>
