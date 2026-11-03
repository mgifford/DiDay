# Accessibility commitment: DI.DAY Canada

This file records how accessibility is handled on the DI.DAY Canada site. It
follows the [ACCESSIBILITY.md](https://mgifford.github.io/ACCESSIBILITY.md/)
framework.

It is a working commitment, not a legal accessibility statement, a conformance
claim, or a substitute for testing with disabled people.

## 1. Project information

| Field | Value |
| --- | --- |
| Project | DI.DAY Canada / Journée de l'indépendance numérique |
| Site | <https://diday.ca> |
| Repository | <https://github.com/mgifford/DiDay> |
| Accessibility owner | Project maintainers |
| Public contact | [GitHub issues](https://github.com/mgifford/DiDay/issues) or [@DIDay@mstdn.ca](https://mstdn.ca/@DIDay) |
| Private contact | Not offered |
| Issue tracker | <https://github.com/mgifford/DiDay/issues> |
| Contributing guide | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Public statement | This file, not a formal conformance statement |
| Target standard | WCAG 2.2 Level AA |
| Additional requirements | None documented for this project |
| Last reviewed | 2026-11-03 |
| Next review due | 2027-05-03, or at launch if earlier |

## 2. Conformance status

**Target only. No conformance claim.**

On 2026-11-02, axe-core reported no WCAG 2.2 A or AA violations and no
best-practice findings across 19 pages in six settings in both Firefox and
Chromium. That is evidence about automated rules, not proof that the site
conforms.

The manual checks in section 6 have not been completed. The scripted browser
checks recorded there are not a substitute for testing with people and
assistive technology. Until both are done, the site targets WCAG 2.2 AA but
must not be described as conforming.

## 3. Scope

### In scope

- The language chooser at `/`, and the English and French pages under `/en/`
  and `/fr/`: home, about, alternatives, cancel, the recipe index, and each
  recipe.
- The generated HTML, CSS and JavaScript, the inline brand SVG, and the
  `calendar.ics` download.
- Both colour themes and both the system preference and the saved theme
  toggle.

### Not in scope

- Content on sites this project links to. Links leave the site and the
  destination's accessibility is its owner's responsibility.
- GitHub, GitHub Pages and GitHub issue forms.
- Mastodon and Gander profiles.
- The behaviour of third-party calendar applications that import
  `calendar.ics`.
- Browser extensions, operating systems, and assistive technology not listed
  in section 6.

Exclusions are about ownership, not permission to ignore a barrier. If a
required step fails for a user, the task is not accessible.

### Third-party services

| Service | User task | Owner | Fallback |
| --- | --- | --- | --- |
| GitHub Pages | Loading every page | GitHub | The build is static and can move to another static host |
| GitHub issues and issue forms | Reporting a problem | GitHub | Report through Mastodon instead |
| Mastodon (`mstdn.ca`) and Gander | Contacting the project | Those services | Report through GitHub instead |

## 4. What the site provides

- Semantic landmarks, one `<h1>` per page, ordered headings, and a visible
  skip link.
- A named language switch that announces the target language, a correct
  `lang` on every page, and French non-breaking spaces before colons.
- Visible focus: a 3px outline with offset on every focusable element.
- Light and dark themes that follow the operating system, plus a toggle that
  saves the choice. There are no animations or transitions.
- A brand SVG with a localised `<title>` and `<desc>`, and decorative icons
  hidden from assistive technology.
- Content in English and French, with descriptive link text.
- No forms, video, audio, charts, maps, tooltips, or data tables, so criteria
  for those features do not currently apply.

## 5. Automated checks

| Check | Scope | Trigger | Failure behaviour |
| --- | --- | --- | --- |
| `npm test`: unit tests, content validation, build | Content rules, bilingual completeness, sources, exclusion rules | Every pull request and deploy | Stops the build |
| `html-validate` with the recommended ruleset | All built HTML | Every pull request and deploy | Stops the build |
| Internal link and anchor check | All pages | Every pull request and deploy | Stops the build |
| axe-core with Playwright in Firefox | 19 pages × light/dark × system/toggle × desktop/phone | Every pull request and the weekly deploy | WCAG 2.2 A/AA violations stop the deploy; best-practice and needs-review findings are reported |
| axe-core with Playwright in Chromium | Same pages and settings | Weekly, and by hand | Opens or updates an "Accessibility problems in Chromium" issue |
| French review warning | Every bilingual text pair | Every pull request and deploy | Warns; does not stop the build |
| External link check | Every URL in the data files | Weekly | Opens or updates a "Broken links" issue |

Tool versions are pinned in `package.json` and `package-lock.json`; the axe
rule tags are `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`.

Passing these checks does not establish conformance. Automated rules cover
only part of WCAG.

## 6. Manual and assistive technology checks

| Check | Status | Evidence or note |
| --- | --- | --- |
| Keyboard operation, every page type | Scripted check passed on 2026-11-03; not tested by a person | A one-off Playwright Firefox script tabbed through all 19 pages. The first stop was the skip link, every focused element had the 3px outline, the skip link moved focus to `main`, the theme toggle switched and saved the theme, and the language switch reached the other language home |
| NVDA with Firefox | Not done | Listed in `LAUNCH.md` section 6 |
| VoiceOver with Safari on iOS | Not done | Listed in `LAUNCH.md` section 6 |
| TalkBack on Android | Not done | Listed in `LAUNCH.md` section 6 |
| 400% zoom and reflow | Scripted check passed on 2026-11-03; not tested by a person | At a 320 CSS pixel viewport, equivalent to 1280 at 400%, no page had horizontal scrolling or an element that overflowed the viewport |
| Text spacing overrides | Scripted check passed on 2026-11-03; not tested by a person | With the WCAG 1.4.12 overrides injected, no text was clipped and no page scrolled horizontally |
| Windows forced-colors mode | Emulated in Firefox on 2026-11-03; not tested in Windows | The `forced-colors` media query applied the system palette and underlined links. No person reviewed the screenshots |
| Light and dark visual review | Not recorded by a person | Automated runs exercise both schemes and the toggle |
| French language quality review | In progress | 140 texts need a fluent reviewer; see `npm run french` |

The scripted checks are not part of `npm test`. They ran in Playwright's Firefox
only, at one viewport per check, and they measure a few properties rather than
looking at the page. Chromium, Safari and assistive technology were not
exercised. Re-run them before launch and record the date.

No assistive technology and browser combination has been evaluated yet. This
table will be replaced with dated combinations and results as testing happens.

## 7. Definition of done

A change is ready when:

1. `npm test` passes.
2. `npm run check:a11y` passes for any change that affects rendered HTML, CSS,
   or JavaScript. Every reported best-practice or needs-review item is fixed or
   explained in the pull request.
3. The changed interaction has been operated by keyboard.
4. Layout changes are checked at 320 CSS pixels wide and at 400% zoom, and in
   both themes.
5. Every new image has useful alternative text; decorative images and icons
   are hidden from assistive technology.
6. New or changed text exists in both languages, and French that has not been
   reviewed is not marked as reviewed.
7. No tracker, cookie, third-party script, or web font is added.
8. The pull request says what was tested and what was not.
9. The rendered output in `_site/` is checked, not only the source template.

No Critical or High severity barrier may be merged unresolved. An exception
must be recorded in the pull request with an owner, a user impact, a
workaround, and a review date.

## 8. Severity and response

Severity describes user impact, not WCAG level.

| Severity | Meaning | Example |
| --- | --- | --- |
| Critical | A core task cannot be completed and no reasonable alternative exists | The page cannot be read or navigated at all |
| High | A major task is blocked or needs an unsafe or very burdensome workaround | The theme toggle cannot be used by keyboard, or the language switch is mislabelled |
| Medium | A task is possible but causes substantial difficulty or confusion | Illogical focus order, or a heading that misrepresents its section |
| Low | Limited impact; the task remains understandable and operable | An alternative text is accurate but unnecessarily long |

This is a volunteer project with no contractual service levels. The aim is to
acknowledge Critical and High reports within 7 days, triage others within 30
days, and fix according to impact and capacity. Reporters will be told when an
issue is accepted, deferred, or closed.

## 9. Known limitations

| Barrier | Scope | User impact | Workaround | Tracking | Owner | Target |
| --- | --- | --- | --- | --- | --- | --- |
| Keyboard checks are scripted only | All pages | Barriers that need a person or assistive technology may remain | Walk the site by hand before launch | `LAUNCH.md` section 6 | Maintainers | Before launch |
| No screen reader testing | All pages | Screen reader users have not been verified | None documented | `LAUNCH.md` section 6 | Maintainers | Before launch |
| Reflow and text spacing checked by script only | All pages | Visual problems at 400% zoom may remain | Check by hand before launch | `LAUNCH.md` section 6 | Maintainers | Before launch |
| Forced-colours mode emulated only | All pages | Windows high-contrast users have not been verified | None documented | This file | Maintainers | Before launch |
| Scripted keyboard, reflow and text-spacing checks ran in Firefox only | Those checks | Other engines may behave differently | Chromium runs axe weekly | This file | Maintainers | Before launch |
| French text awaiting review | French pages | Translation errors may confuse readers | English pages are available | `npm run french` | Maintainers | Before launch |
| No formal accessibility evaluation | Whole site | No conformance claim can be made | None | This file | Maintainers | Before any claim |
| Linked sites and profiles are not controlled | External destinations | Barriers may exist after leaving this site | Contact the destination owner | Not applicable | Destination owners | Not scheduled |
| Calendar behaviour varies by client | `calendar.ics` | Assistive technology behaviour in calendar apps is unknown | Use the dates on the page | This file | Maintainers | Before launch |

If a barrier is not listed here, that does not mean none exists. Report it.

## 10. Reporting an accessibility barrier

- GitHub: <https://github.com/mgifford/DiDay/issues>
- Mastodon: [@DIDay@mstdn.ca](https://mstdn.ca/@DIDay) (public mention or direct
  message)
- If GitHub is inaccessible, use Mastodon. Reports are welcome in English or
  French.

Useful details:

- the task you were trying to complete;
- the page or feature;
- what happened and what you expected;
- whether a workaround exists;
- browser, operating system, device, and assistive technology versions, if
  you are comfortable sharing them.

Please do not post medical, account, authentication, or other sensitive
personal information in a public issue.

## 11. Automation and AI-assisted work

AI tools may help draft code, content, and tests. Their output is reviewed and
verified in the rendered site before merge. Contributors must not claim manual
or assistive technology testing that was not performed, and must disclose
material AI assistance in the pull request.

Automated accessibility results are treated as indicators. A clean axe run is
never reported as proof of conformance.

## 12. Ownership and review

Maintainers own this file, the automated checks, and the manual testing plan.

Review this file:

- at launch;
- after a significant layout, theme, navigation, or content-model change;
- after an accessibility incident or audit;
- when the target standard changes;
- when reporting routes or owners change;
- otherwise at least once a year.

### Change history

| Date | Change | Evidence | Reviewer |
| --- | --- | --- | --- |
| 2026-11-02 | First version | Repository review and the automated runs recorded above | Project maintainers |
| 2026-11-03 | Record the scripted keyboard, reflow, text-spacing and forced-colours checks | One-off Playwright Firefox run across 19 pages | Project maintainers |

## 13. References

- [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding WCAG 2.2 conformance](https://www.w3.org/WAI/WCAG22/Understanding/conformance)
- [WAI: Evaluating web accessibility](https://www.w3.org/WAI/test-evaluate/)
- [ACCESSIBILITY.md framework](https://mgifford.github.io/ACCESSIBILITY.md/)
- [README.md](README.md)
- [LAUNCH.md](LAUNCH.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
