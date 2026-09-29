# Launch checklist

Work through the sections in order. Items marked "watch" are first runs of
automation that has only been tested in a sandbox.

## 1. Decisions

- [ ] Choose the site name in English and French (currently "First Sunday / Premier dimanche").
- [ ] Choose the address: a GitHub Pages address or a custom domain.
- [ ] Name at least two maintainers, at least one fluent in French.
- [ ] Confirm the licences: GNU AGPL v3 for code, CC BY-SA 4.0 for content.

## 2. Repository

- [ ] Create the repository and push with `main` as the default branch.
- [ ] Settings > Pages: set Source to "GitHub Actions".
- [ ] Settings > Actions > General: allow workflows to create issues (workflow permissions).
- [ ] Create the label `out-of-date` (used by the issue form).
- [ ] In `data/site.yaml`, set `repo`, `report_url` and `url`.
- [ ] Remove the `github.com/OWNER/REPO` line from `data/link-check.yaml`.
- [ ] Watch: the first build and deploy, including the Firefox accessibility check.

## 3. Mastodon account on mstdn.ca

- [ ] Read the mstdn.ca server rules, and ask the moderators whether an account that posts one automated reminder a month should be marked as automated. Their rules require bot accounts to delete posts within a month; the reminders are deleted after 30 days.
- [ ] Create the account. Write the profile in English and French, and link the site.
- [ ] Development > New application "First Sunday inbox", scope `read:notifications` only. Save its token as the repository secret `MASTODON_TOKEN`.
- [ ] Development > New application "First Sunday reminders", scopes `read:statuses` and `write:statuses` only. Save its token as `MASTODON_POSTING_TOKEN`. The name must match `MASTODON_APP_NAME` in `.github/workflows/reminders.yml`, because clean-up only deletes posts made by this application.
- [ ] Set `mastodon: "@name@mstdn.ca"` in `data/site.yaml`. This shows the Mastodon option on the site and the notice on the About page that public mentions are copied to GitHub.
- [ ] Watch: run "Mastodon inbox" by hand, mention the account from a personal account with a public post, and check one issue appears. Send a direct message and check nothing appears.
- [ ] Watch: run "Monthly reminder" by hand with "live" off, and read the run summary.

## 4. Gander

- [x] Create a Gander account for the project: `diday.gander.social`.
- [ ] On each first Sunday, copy the text from the "Monthly reminder" run summary and post it by hand. Delete it after 30 days.
- [ ] Revisit automation when Gander offers a public posting API or full AT Protocol interoperability. As of 2026-09-29: the handle resolves on the AT Protocol (confirmed via Bluesky's own `resolveHandle` endpoint), but is not yet visible through Bluesky's app or API, and gandersocial.ca has no public developer API or self-serve app tokens (see README.md's Gander section for the sources).

## 5. Content

- [ ] Decide which sample entries to keep. Remove or complete the rest.
- [ ] For each entry: replace placeholder Wikipedia sources with primary sources where possible, check each claim listed under `supports`, then set `verified: true` and `last_reviewed`.
- [ ] Replace U.S. cancellation links with Canadian (.ca, en-ca, fr-ca) pages.
- [ ] Add a Wikidata ID to each entry that has one.
- [ ] Research Hushmail's ownership, or leave it as a draft.
- [ ] French review by a fluent reader, then `npm run french -- approve ...`.
- [ ] Write at least one more recipe so the first month has a choice.

## 6. Accessibility and sustainability

- [ ] Keyboard-only walk through every page type.
- [ ] Screen reader test: NVDA with Firefox, VoiceOver with Safari on iOS, TalkBack on Android. Check the language switch is announced in the right language.
- [ ] Zoom to 400% and check reflow; check Windows high contrast mode.
- [ ] Record page weight and requests for the home page and one recipe page as a baseline.

## 7. First month of automation

- [ ] Watch: the first scheduled weekly run (links, Wikidata ownership, Chromium accessibility). Expect "blocked" results from large sites; check them by hand once.
- [ ] Watch: the first monthly review check on the 1st.
- [ ] Watch: the first live reminder on the first Sunday, and its deletion 30 days later.
- [ ] Triage every issue the automation opens within a week, so the issue list stays trustworthy.

## 8. Announce

- [ ] Tell the DI.DAY organisers (di.day) and Doeidag, and ask to be listed among related campaigns.
- [ ] Post the launch on Mastodon and Gander.
