# Digital Independence Day / Journée de l'indépendance numérique

## First Sunday / Premier dimanche (working title)

A bilingual Canadian site that combines two models:

- **Switch recipes**, after [DI.DAY](https://di.day/en) and [Doeidag](https://doeidag.nl/): move one service away from Big Tech on the first Sunday of every month.
- **Cancel links**, after [Resist and Unsubscribe](https://www.resistandunsubscribe.com/): direct instructions for cancelling U.S. subscriptions, each paired with alternatives.

It now also carries a participation-focused homepage, twelve recurring monthly
themes, an international movement page, and a design system.

Content review status: most catalogue entries are still `verified: false` and
say so on the page. The design system, themes and structure are built; the
editorial verification is not finished.

See `LAUNCH.md` for the launch checklist and `ACCESSIBILITY.md` for the accessibility target, automated checks, manual testing status and known gaps.

## Principles

- English and French are equal. The build fails if any text is missing in either language.
- Listed alternatives are Canadian owned, open source, or European owned, ranked in that order. Anything else is a labelled exception.
- Services owned in Russia, Belarus or China are never listed.
- Every claim about headquarters, ownership or open source needs a supporting source. The build fails without one.
- Headquarters and ownership are recorded separately. Ownership decides. `null` means "not yet researched".
- No trackers, cookies, third-party scripts or web fonts.
- Static HTML only, so the site can move from GitHub Pages to Codeberg Pages or any other host without code changes.

## Run it locally

Requires Node.js 22 or later.

```sh
npm install
npm start          # local server with live reload
npm test           # unit tests, content check, build, HTML and internal links
npm run check:links     # also checks external links (needs network)
npm run check:wikidata  # compares ownership with Wikidata (needs network)
npm run check:a11y      # axe-core in Firefox (run `npx playwright install firefox` once first)
npm run check:a11y:chromium  # Chromium only
npm run check:a11y:all       # Firefox, then Chromium
npm run check:a11y:behaviour # keyboard, focus, 320px reflow, text spacing,
                             # forced colours, reduced motion, nav groups
npm run french          # lists French text that needs review
npm run check:reviews   # lists entries by review date
```

## Where things live

| Path | Contents |
| --- | --- |
| `data/site.yaml` | Site name, tagline, repository URL, languages |
| `data/strings.yaml` | All interface text in English and French |
| `data/regions.yaml` | Which countries count as European, and which are excluded |
| `lib/qualify.js` | Inclusion and ranking rules |
| `data/categories.yaml` | Categories such as e-books and email |
| `data/alternatives.yaml` | Alternatives, with origin, ownership and sources |
| `data/cancel.yaml` | U.S. subscriptions and cancellation links |
| `data/recipes.yaml` | Step-by-step switch recipes |
| `scripts/validate.js` | Content checks run before every build |
| `src/` | Templates, CSS and JS |
| `src/js/theme.js` | Light/dark theme toggle, overriding the OS setting |
| `src/js/nav.js` | Navigation groups: Escape, close on outside click, one open at a time |
| `data/nav.yaml` | The site's navigation structure |
| `data/themes.yaml` | The monthly theme, one entry per month number |
| `data/global-stories.yaml` | International campaigns and directories, rendered at `/world/` |
| `data/initiatives.yaml` | Canadian ecosystem records; the directory page lands in PR 3 |
| `src/_includes/nav.njk` | Renders the navigation from `data/nav.yaml` |
| `src/css/style.njk` | The stylesheet template: concatenates the partials below into `/css/style.css` |
| `src/_includes/css/tokens.css` | Design tokens: palette, semantic colours, type scale, spacing |
| `src/_includes/css/base.css` | Reset, typography, links, focus, forced colours, reduced motion |
| `src/_includes/css/layout.css` | Page width, vertical rhythm, grids |
| `src/_includes/css/components.css` | Every reusable component |
| `docs/DESIGN-SYSTEM.md` | Design system: goals, tokens, tested contrast, component rules |
| `docs/INFORMATION-ARCHITECTURE.md` | Navigation structure, why the disclosure pattern, what ships when |
| `docs/ECOSYSTEM-RESEARCH.md` | Canadian ecosystem research inventory and its sources (phase 5, research only) |
| `docs/ECOSYSTEM-EDITORIAL-POLICY.md` | Inclusion, evidence, featured and correction rules for the ecosystem directory |
| `docs/ECOSYSTEM-SCHEMA.md` | Record format for `data/initiatives.yaml`, and why projects are deferred |
| `lib/initiatives.js`, `test/initiatives.test.js` | Validator for ecosystem records and its tests |
| `src/pages/styleguide.njk` | Rendered design system reference at `/en/styleguide/` and `/fr/styleguide/` |
| `src/pages/world.njk` | The international page at `/world/` |
| `src/pages/canada.njk` | The Canadian ecosystem directory at `/canada/` |
| `data/review.yaml` | How long a review stays current |
| `lib/reviews.js`, `scripts/check-reviews.js` | Review date tracking |
| `data/link-check.yaml` | URLs the link checker skips |
| `lib/links.js`, `scripts/check-links.js` | Link checker |
| `lib/wikidata.js`, `scripts/check-wikidata.js` | Ownership check against Wikidata |
| `lib/translations.js`, `scripts/french.js`, `data/translations.lock.yaml` | French review tracking |
| `lib/serve.js`, `scripts/check-a11y.js` | Accessibility check (axe-core) |
| `scripts/check-a11y-behaviour.js` | Keyboard, focus, nav groups, reflow, text spacing, forced colours, reduced motion, assets |
| `scripts/report-issue.sh` | Opens or updates an issue with a report (GitHub only) |
| `lib/themes.js`, `test/themes.test.js` | Which monthly theme the homepage shows |
| `test/` | Unit tests, run without network access |
| `.github/workflows/pages.yml` | Build, validate and deploy to GitHub Pages |
| `.github/workflows/checks.yml` | Weekly link, ownership and Chromium accessibility checks |
| `.github/workflows/reviews.yml` | Monthly review date check |
| `.github/workflows/reminders.yml` | Daily: monthly reminder posts and 30-day clean-up |
| `lib/reminders.js`, `scripts/reminders.js` | Reminder posting and deletion |
| `LAUNCH.md` | Launch checklist |
| `ACCESSIBILITY.md` | Accessibility target, checks, manual testing status and known gaps |
| `.github/workflows/mastodon.yml` | Daily Mastodon inbox |
| `lib/mastodon.js`, `scripts/mastodon-inbox.js` | Turns public Mastodon mentions into issues |
| `.github/ISSUE_TEMPLATE/out-of-date.yml` | Bilingual form for reporting a problem |

## Deploying to GitHub Pages

1. Push to a repository with `main` as the default branch.
2. In Settings, Pages, set Source to "GitHub Actions".
3. The workflow sets the path prefix automatically, so project pages (`/repo-name/`) and custom domains both work.
4. The site rebuilds every Monday so the next date stays correct. The same build moves the monthly theme on, because the theme is chosen from the month of the next first Sunday: after each DI.DAY the theme switches within a day, and a first Sunday that falls on the 1st is no different.

## Automated maintenance

Every build and pull request:

- Content rules: both languages complete, a source for every claim, inclusion and exclusion rules.
- HTML validation and links between pages, including `#` anchors.
- **Accessibility.** axe-core runs on every page in Firefox, in light and dark colour schemes, at desktop and phone widths. Any WCAG 2.2 A or AA failure stops the deploy. Best-practice findings and items needing human review appear in the run summary. Automated testing finds only part of the problems, so manual and screen reader testing are still needed.
- **French review.** A warning, not a failure, lists French text not yet reviewed against the current English.

Every Monday:

- The site rebuilds so the next date and the current monthly theme are correct.
- **Link check.** Every URL in the data files is requested. Broken links (404, 410, no response, repeated server errors) open or update an issue titled "Broken links". Responses such as 403 and 429 usually mean a site refused an automated request, so they are listed for a person to check but do not open an issue on their own.
- **Accessibility in Chromium.** The same axe-core check runs in Chromium, to catch problems that appear in only one browser engine. WCAG failures open or update an issue titled "Accessibility problems in Chromium".
- **Ownership check.** For each alternative with a `wikidata` ID, the check follows "parent organization" and "owned by" up to the top owner and compares that owner's country, and the headquarters country, with the data. Any disagreement opens or updates an issue titled "Ownership changes to review", and ownership moving to an excluded country is called out.

Neither check edits the data. Wikidata can be wrong or out of date, so a maintainer confirms changes against a primary source.

On the first of each month:

- **Review dates.** Entries whose `last_reviewed` date has expired open or update an issue titled "Content due for review". The report also lists entries due in the next 30 days, so they can be reviewed before the first Sunday. Reviews last 12 months for alternatives and recipes and 6 months for cancel entries, set in `data/review.yaml`. Entries never reviewed are listed but do not open an issue.

## Reports from the public

Every alternative, cancel entry and recipe has a "Report a problem with ..." link, whatever its review state. It opens the bilingual issue form in `.github/ISSUE_TEMPLATE/out-of-date.yml` with the entry name and page filled in.

Mastodon is the preferred route, because it does not need a GitHub account. When `mastodon` is set in `data/site.yaml`, each entry invites people to mention the project account first, with GitHub as the second option.

### Mastodon inbox

Every day, `.github/workflows/mastodon.yml` reads mentions of the project account and opens one issue per public mention, with a link to the original post and any entries it names.

- **Public posts only.** Unlisted, followers-only and direct messages are skipped and never copied anywhere, because their authors did not publish them openly.
- **No pinging on GitHub.** `@name` and `#123` in quoted posts are altered so they do not notify GitHub users or link to issues.
- **Read only.** The account's token needs only the `read:notifications` scope. The script never posts, replies or dismisses notifications, so maintainers still see every mention in the Mastodon app.
- **No duplicates.** Before opening an issue, it searches existing issues for the post's link.

Setup:

1. Create the project account on mstdn.ca. See `LAUNCH.md` about whether to mark it as automated.
2. In the account's Development settings, create an application with only the `read:notifications` scope and copy its access token.
3. Add the token as a repository secret named `MASTODON_TOKEN`.
4. Set `mastodon: "@name@mstdn.ca"` in `data/site.yaml`.

Try it without opening issues: `MASTODON_TOKEN=... npm run mastodon`, then read `reports/mastodon.md`.

### Monthly reminders

`.github/workflows/reminders.yml` runs daily. On the first Sunday it posts one reminder in English and one in French, each tagged with its language so screen readers and filters handle it correctly. Every day it deletes reminders older than 30 days. It only deletes posts made by the "DI.DAY Canada reminders" application and never deletes pinned posts, so anything a person posts from the account is left alone.

It needs `url` set in `data/site.yaml` and a repository secret named `MSTDN`, holding a token with only the `read:statuses` and `write:statuses` scopes, which the workflow passes to `scripts/reminders.js` as `MASTODON_POSTING_TOKEN`. The text is in `data/strings.yaml` under `reminder_post`, with several variants so the wording isn't identical every month. Hashtags use CamelCase so screen readers read them as words.

Gander has no public posting interface, so the run summary includes the text for a person to post there by hand.

Try it: `npm run reminders` (dry run, writes `reports/reminder.md`).

### Gander

Gander is listed as an alternative. It cannot yet be a reporting channel, because it does not connect to Mastodon and does not offer the same kind of access. Revisit once Gander connects to other networks.

The project's handle, `diday.gander.social`, resolves on the AT Protocol (the open standard Bluesky also uses): `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=diday.gander.social` returns a `did:plc:` identity. It is not yet visible through Bluesky's own app or API (`app.bsky.actor.getProfile` returns "Profile not found" as of 2026-09-29), matching Gander's FAQ: "Today, Gander gives users the option to view content from Bluesky," with full interoperability (posting that reaches Bluesky, and a public developer API) listed as a future goal, not a current feature. There is no public API sign-up; the only integration route mentioned on gandersocial.ca is a partnership inquiry ("Talk to us" on the Why Gander page).

## Reviewing an entry

1. Check each source still supports the claims listed under `supports`.
2. Check the cancellation link or recipe steps still work.
3. Set `last_reviewed` to today's date (`YYYY-MM-DD`) and `verified: true`.

Pages show the review date. Once a review expires, the page also says the information may be out of date, until someone reviews it again.

## Reviewing French

`data/translations.lock.yaml` records a fingerprint of each English and French pair when a fluent reviewer approves it. If either side changes later, the pair is flagged again.

```sh
npm run french                                   # what needs review, written to reports/french.md
npm run french -- approve alternatives.kobo.notes
npm run french -- approve --prefix recipes.ebooks-without-amazon
npm run french -- approve --all                  # only after reviewing everything listed
```

On French pages, items awaiting review show "Traduction pas encore révisée", and the footer notes when interface text is pending. English pages show nothing.

## Moving off GitHub later

The output in `_site/` is plain HTML and CSS. To move to Codeberg Pages, run the same build in Forgejo Actions or Woodpecker CI, or push `_site/` to a `pages` branch.

## Known gaps

- Cancellation URLs are the U.S. pages listed by Resist and Unsubscribe. Canadian (.ca, en-ca, fr-ca) pages still need to be found.
- Wikipedia sources are placeholders. Primary sources are preferred.
- French text needs review by a fluent francophone. All French texts are currently marked as not reviewed (run `npm run french` for the current count).
- URL slugs are English in both languages.
- Siteimprove Alfa is deferred. axe-core is in CI.
- The Firefox check uses Playwright's Firefox, a patched build rather than the release build. Keyboard, reflow, text-spacing, forced-colours, reduced-motion and navigation-group checks are scripted and run in CI with `npm run check:a11y:behaviour:all`; no screen reader testing has been done. See `ACCESSIBILITY.md`.
- The design system page at `/en/styleguide/` is linked from the About page. It is left out of `sitemap.xml` on purpose; it is a reference for contributors, not campaign content.
- The external link check and the Wikidata ownership check run weekly in CI; the most recent run passed on 26 October 2026.
- Hushmail has no Wikidata item.
- The Mastodon inbox and reminders have been tested against a simulated server, not mstdn.ca.
- Gander reminders are posted by hand.
- Issue search can lag behind new issues, so a duplicate is possible if the inbox runs twice within minutes.
- The date is computed in UTC at build time.

## Licence

Code: [GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.html) or later (see `LICENSE`). Content in `data/`: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

AGPL, rather than MIT, so that anyone who runs a modified version of this
site as a public service - not just anyone who redistributes the code -
must also offer its source. A fork stays open the same way the original is.
