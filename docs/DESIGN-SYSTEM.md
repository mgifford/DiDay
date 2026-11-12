# DI.DAY Canada design system

Status: **phase 1 of 6.** This document describes what exists today, not an
aspiration. Anything marked *Not built* is a plan, and says why it waits.

The system is the stylesheet in `src/_includes/css/`, concatenated into
`/css/style.css` by `src/css/style.njk`. The rendered reference is at
`/en/styleguide/` and `/fr/styleguide/`, built from the same CSS and the same
templates as every other page.

- Change a token, not a component, when a colour or size changes.
- Change a component only when a new pattern is repeated.
- Run `npm test` before anything else; it checks the contrast table below.

---

## 1. Design goals

1. **Human-centred.** People taking a practical step together. Not padlocks,
   server racks, circuit boards or abstract network diagrams.
2. **Recognizable.** One identity across pages, share cards, posters and
   organizer material.
3. **Accessible.** WCAG 2.2 AA is the floor, not the target. Every state has a
   tested contrast ratio.
4. **Lightweight.** System fonts, SVG and semantic HTML. No animation library,
   no framework, no web font, no third-party request.
5. **Reusable.** Tokens and components, so a new page costs markup, not CSS.
6. **Honest.** No invented testimonials, participation counters or statistics.
   Unverified content says so, on the page, in both languages.

## 2. Audience and participation principles

The site is written for someone who has never heard of digital independence
and is not part of the open-source or digital-rights community. That shapes the
visual language:

- **No assumed vocabulary.** "Move one service away from Big Tech" beats
  "de-platform your data stack".
- **Small steps are the design.** A recipe that takes 15 minutes is presented
  as complete, not as a partial version of a bigger migration.
- **Collective framing.** Participation is something people do together, so
  later phases need cards, themes and events that read as invitations rather
  than as a product catalogue.
- **Leaving is not the only goal.** Privacy, portability, interoperability,
  affordability, accessibility and community governance matter. Canadian
  ownership is context, not proof of independence.

## 3. Brand relationship with the international movement

DI.DAY Canada follows the international campaign at [diday.org](https://diday.org/en/)
(operated by CCC Hansestadt Hamburg e.V.) and the Dutch [Doeidag](https://doeidag.nl/).
It shares the idea of the first Sunday of the month. It is not presented as an
official chapter, and no page claims a formal affiliation.

**What the international assets are licensed under.** Checked on 2026-11-12 at
<https://diday.org/en/legal/>:

| Asset | Licence | Reuse |
| --- | --- | --- |
| Site content generally | CC0 | Free |
| `logo.svg`, `favicon.svg` (Stella Schiffczyk, 2026) | CC BY 4.0 | Free **with attribution** |
| Illustrations and photographs (Florian Biege, 2026) | Custom: "free use of the illustration within the framework of the DIDAY initiative" | Campaign use, not a standard open licence |
| Site code | [codeberg.org/DI-Day/website](https://codeberg.org/DI-Day/website) | Not copied by this project |

**What this project does.** It uses its own mark (`src/_includes/brand.njk`),
its own favicon and its own share cards. None of the international logo,
illustrations or photographs are copied into this repository, so there is
nothing to attribute and nothing to mis-license.

**If the Canadian chapter adopts the international logo later**, it must:

1. include the attribution "Logo: Stella Schiffczyk, CC BY 4.0" in the footer
   or on an attribution page;
2. keep the attribution with any derivative, including posters and social
   cards;
3. treat the photographs as permission for campaign use only, crediting
   Florian Biege, and not as reusable stock.

This is a decision for the maintainers, not a design change. Record it in
`ACCESSIBILITY.md`'s review triggers if it happens, because a new logo changes
alt text, the share card and the favicon together.

## 4. Colour

Two layers in `tokens.css`:

- **Primitives** (`--c-purple-600`, `--c-cream-50`) are raw values. Components
  never use them.
- **Semantic tokens** (`--brand`, `--paper`, `--ink`) say what the colour is
  *for*. Components only use these.

That is what makes the dark scheme a token swap instead of a second stylesheet.

### Values

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--paper` | `#fbf6ec` | `#14110e` | Page background |
| `--surface` | `#fffcf5` | `#262019` | Cards, notices, raised blocks |
| `--ink` | `#1c1a17` | `#f2ede4` | Body text, headings |
| `--muted` | `#5a554c` | `#c0b7a8` | Metadata, sources, secondary text |
| `--brand` | `#5b2a86` | `#c9a7f0` | Links, primary buttons, focus |
| `--brand-strong` | `#4e2372` | `#e0c9fa` | Hover and active on brand |
| `--accent` | `#b43a0a` | `#ffa06b` | Small accent text, destructive-ish actions |
| `--accent-bright` | `#d9501a` | `#ffb088` | Large text and non-text marks only |
| `--forest` | `#1f4d3a` | `#8fd3b0` | The next date, positive status |
| `--danger` | `#a4221a` | `#ff8a80` | Cancellation links |
| `--rule` | `#e2d8c6` | `#3b342b` | Decorative dividers only |
| `--rule-control` | `#8a8071` | `#7a6e5f` | Borders that identify a control |
| `--focus` | `#5b2a86` | `#c9a7f0` | Focus ring |
| `--on-brand` | `#fffcf5` | `#14110e` | Text on `--brand` |
| `--on-accent` | `#ffffff` | `#14110e` | Text on `--accent` |

### Tested combinations

Measured with the WCAG 2.x relative luminance formula. `test/tokens.test.js`
asserts every row, in both schemes, on every run.

| Pair | Light | Dark | Needs |
| --- | --- | --- | --- |
| `--ink` on `--paper` | 16.12:1 | 16.13:1 | 4.5:1 |
| `--muted` on `--paper` | 6.87:1 | 9.48:1 | 4.5:1 |
| `--brand` on `--paper` | 9.19:1 | 9.20:1 | 4.5:1 |
| `--accent` on `--paper` | 5.49:1 | 9.40:1 | 4.5:1 |
| `--forest` on `--paper` | 8.94:1 | 10.85:1 | 4.5:1 |
| `--danger` on `--paper` | 6.91:1 | 8.24:1 | 4.5:1 |
| `--ink` on `--surface` | 16.94:1 | 13.82:1 | 4.5:1 |
| `--brand` on `--surface` | 9.67:1 | 7.88:1 | 4.5:1 |
| `--accent` on `--surface` | 5.77:1 | 8.05:1 | 4.5:1 |
| `--on-brand` on `--brand` | 9.67:1 | 9.20:1 | 4.5:1 |
| `--on-accent` on `--accent` | 5.92:1 | 9.40:1 | 4.5:1 |
| `--focus` on `--paper` | 9.19:1 | 9.20:1 | 3:1 |
| `--rule-control` on `--paper` | 3.61:1 | 3.78:1 | 3:1 |

### Rules

- **`--accent-bright` is not for small text.** It reaches 3.81:1 on paper,
  which is a pass for large text and non-text marks, and a fail for body copy.
  Use `--accent` for small text.
- **`--rule` is decorative.** A divider may use it; a button border may not.
  Borders that identify a control use `--rule-control`, because WCAG 1.4.11
  needs 3:1 for those.
- **Never colour alone.** "Listed because" is green *and* says "Listed because".
  A cancellation link is red *and* is a link with text.
- **Shadows are light-scheme only.** `--shadow-card` and `--shadow-raised`
  become `none` in dark, where they read as smudges; surfaces separate by
  colour instead (1.17:1, which the tests assert).

### Why the scheme is declared three times

`--paper` and friends are declared in `:root`, again in
`@media (prefers-color-scheme: dark)`, and again in `:root[data-theme="dark"]`.
The shorter `light-dark()` function is supported in current browsers but not in
older ones, and a browser without it loses **every** colour at once rather than
just the dark theme. The audience includes people on old devices, so the
verbose version wins.

### Palette history

The previous palette was a cool blue-green (lake `#1f4e6b`, spruce `#2e5a46`,
maple `#a4221a`) on a near-white background. The campaign direction — purple,
orange, cream, dark green, near-black — was adopted as an evolution:

- cream replaces the cool near-white, which makes the site feel less like a
  documentation site and more like a printed poster;
- purple becomes the interactive colour, replacing lake;
- dark green stays, so the date and the "listed because" line keep their
  existing meaning;
- maple is retained as `--danger` for cancellation links, which keeps the
  existing favicon and share cards coherent.

`--accent-bright`'s brighter orange exists because the safe orange for text
(`#b43a0a`) is too dark to read as "warm" in large display use.

## 5. Typography

System fonts only. Nothing is downloaded, so nothing blocks rendering and
there is no layout shift.

| Token | Stack | Role |
| --- | --- | --- |
| `--font-serif` | Iowan Old Style, Charter, Bitstream Charter, Sitka Text, Cambria, Georgia | Headings, the next date, the site name |
| `--font-sans` | system-ui, Segoe UI, Roboto, Noto Sans, Helvetica, Arial | Body, interface, metadata |
| `--font-mono` | ui-monospace, Menlo, Consolas | Token names, code, technical labels |

Scale, with the role each size plays:

| Token | Size | Role |
| --- | --- | --- |
| `--text-xs` | 0.8125rem (13px) | Badges, labels |
| `--text-sm` | 0.9375rem (15px) | Metadata, sources, footer |
| `--text-base` | 1.0625rem (17px) | Body |
| `--text-lg` | 1.25rem (20px) | Card titles, site name, lead-ins |
| `--text-xl` | clamp(1.5rem → 2rem) | Section headings, hero headline |
| `--text-2xl` | clamp(2rem → 3rem) | Page title |
| `--text-3xl` | clamp(2rem → 3.25rem) | The next date |

Rules:

- **End with font size, not with a fixed height.** Every size above is in
  `rem` or a `clamp()`, so the browser's text-size setting is honoured.
- **Headings are the outline.** Do not skip a level to get a size. Use
  `--text-lg` on an `h3` if the heading needs to be smaller; never use `h4`
  after `h2` to look right.
- **Body text is never smaller than 15px** (`--text-sm`) and metadata never
  smaller than 13px (`--text-xs`). Nothing on the site is 12px.
- **No all-caps for sentences.** The eyebrow style is small and semibold, not
  uppercase, because uppercase slows reading for people with dyslexia and
  removes word shape.
- **Line length stays near 42rem.** That is roughly 70 characters at the body
  size.

## 6. Space, layout, shape

| Token | Value | Role |
| --- | --- | --- |
| `--space-3xs` | 0.25rem | Tight gaps inside a component |
| `--space-2xs` | 0.5rem | Related items |
| `--space-xs` | 0.75rem | Component padding |
| `--space-s` | 1rem | Paragraph spacing |
| `--space-m` | 1.5rem | Between components |
| `--space-l` | 2.25rem | Between sections |
| `--space-xl` | 3rem | Page top and bottom |
| `--space-2xl` | 4.5rem | Large separation, used rarely |
| `--measure` | 42rem | Body column |
| `--measure-wide` | 56rem | Card grids, the language chooser |
| `--radius-sm` | 0.3rem | Buttons, small surfaces |
| `--radius` | 0.6rem | Cards |
| `--radius-lg` | 1rem | Large panels (not used yet) |
| `--radius-pill` | 999px | Badges |
| `--border-width` | 1px | Dividers and card edges |
| `--border-width-strong` | 2px | Buttons |
| `--focus-width` | 3px | Focus ring |
| `--focus-offset` | 3px | Gap between element and ring |
| `--tap-target` | 2.75rem | Minimum height for a control (44px) |

**Breakpoints** are documented constants, because CSS cannot read a custom
property inside a media query:

| Name | Width | What changes |
| --- | --- | --- |
| `sm` | 40rem (640px) | Two-column `.split`, wide language chooser |
| `md` | 56rem (896px) | `.wrap--wide` grids gain columns via `auto-fit` |
| `lg` | 68rem (1088px) | Reserved for the phase 2 navigation |

Layout primitives:

- `.wrap` — the body column; `.wrap--wide` for grids.
- `.section` — a themed block with its own vertical spacing.
- `.stack` — vertical rhythm between arbitrary children.
- `.cluster` — things side by side that wrap (action rows, badge rows).
- `.card-grid` — responsive cards, `auto-fit` with a 16rem minimum.
- `.split` — two columns from 40rem up.

## 7. Components

Every component below exists in the stylesheet and is demonstrated on
`/en/styleguide/`. Markup shown is the real markup.

### Hero

```html
<section class="hero">
  <p class="hero__eyebrow">Eyebrow</p>
  <h1>On the first Sunday of every month, move one service away from Big Tech.</h1>
  <p class="hero__lead">One short explanation.</p>
  <p class="cluster">
    <a class="button button--primary" href="/en/recipes/">Start with a recipe</a>
    <a class="button" href="/en/about/">How it works</a>
  </p>
</section>
```

One `h1` per page. The hero owns it. The eyebrow is optional and must not
repeat the headline.

### Buttons

| Class | Use |
| --- | --- |
| `.button--primary` | The single most likely action on the page |
| `.button` | Secondary action, outlined |
| `.button--accent` | A destructive or urgent action; rare |
| `.button--quiet` | Looks like a link, keeps button semantics |

- One primary button per screen region. Two primaries cancel each other out.
- Minimum height `--tap-target` (44px), which is larger than WCAG 2.5.8's 24px.
- The focus ring is offset onto the page background, so it is visible on a
  filled button too.
- A button is a `<button>` when it does something, an `<a class="button">` when
  it goes somewhere. The class does not change the semantics.

### Cards

```html
<article class="card">
  <h3 class="card__title"><a href="…">Reading e-books without Amazon</a></h3>
  <p class="card__meta">30 minutes · easy</p>
  <p class="card__body">One sentence.</p>
  <p class="card__footer"><a href="…">Read the recipe</a></p>
</article>
```

One card component serves recipes, monthly themes, events, organizations and
international stories. What differs per content type is the heading level and
the metadata line, not the layout. `.card__footer` uses `margin-top: auto` so
cards in a row line up.

- The card is not itself a link. Real links inside it keep text selection,
  open-in-new-tab and screen reader link lists working.
- Card borders use `--rule`, which is decorative. A card is a grouping, not a
  control, so it does not need 3:1.

### Badges and flags

`.badge` for a short attribute (`.badge--brand`, `.badge--accent`).
`.flag` for an editorial caveat such as "Sample entry, not yet reviewed."

A flag is not an error state. It is the project's honesty mechanism and must
never be hidden to make a page look finished.

### Notices

```html
<div class="notice notice--warn">
  <p>One short sentence.</p>
</div>
```

`.notice` (information), `.notice--warn` (caution), `.notice--ok`
(confirmation). The coloured left border is decoration; the words carry the
meaning.

Do **not** put `role="status"` on a notice that is already in the HTML at load.
`role="status"` announces a change after load; on static content it either says
nothing or interrupts. Reserve it for text a script inserts.

### Facts list

`dl.facts` for labelled short values — time, difficulty, headquarters,
ownership, open source. Renders as a wrapped row, with the colon added in CSS
and a non-breaking space before it in French.

### Disclosure

Native `<details>`/`<summary>`. No ARIA, no script. Keyboard support, focus and
state come from the element itself.

### Breadcrumbs

```html
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol>
    <li><a href="/en/">Home</a></li>
    <li><a href="/en/recipes/">Switch recipes</a></li>
    <li aria-current="page">Reading e-books without Amazon</li>
  </ol>
</nav>
```

The separator is drawn in CSS, so it is never read aloud and never needs
translating. The `aria-label` is translated.

### Header, navigation, language switch, theme toggle

- One `<nav aria-label>` per page, currently the site navigation.
- `aria-current="page"` on the current item; sections use `aria-current="true"`.
- The language switch names its destination **in that language**
  (`aria-label="Passer au français"` on the English page) and carries
  `hreflang` and `lang`.
- The theme toggle is hidden without JavaScript, because it cannot persist a
  choice without script and the site sets no cookies. Without it the page still
  follows the operating system setting.

### Metadata

`.sources`, `.reviewed`, `.report` carry attribution, review date and the
report-a-problem route. They are deliberately small and muted, and always
present — never removed to tidy a page.

## 8. Responsive behaviour

Verified by `npm run check:a11y:behaviour` at a 320 CSS pixel viewport, which is the
reflow case for 400% zoom on a 1280 pixel screen.

- No horizontal scrolling at 320px, in either language.
- The header wraps to two rows on a narrow screen rather than squeezing the
  site name into two lines.
- The site name is `white-space: nowrap`; everything else wraps.
- Navigation wraps onto as many lines as it needs. Phase 2 will replace it with
  a smaller top-level set, not a hamburger menu.
- Card grids fall to one column below 16rem of available width.
- Dates use `columns: 2 14rem`, so they are two columns when there is room.
- Tap targets stay at least 44px.

## 9. Accessibility requirements

`ACCESSIBILITY.md` is the binding commitment. This section is what the design
system owes it.

- **Focus.** One ring everywhere: 3px `--focus`, 3px offset. Never
  `outline: none` without a replacement.
- **Target size.** 44px minimum for controls, through `--tap-target` or the
  padding/negative-margin trick used for inline navigation links.
- **Colour independence.** Every colour-coded state has a text equivalent.
- **Contrast.** The table in section 4, asserted by tests.
- **Reflow and text spacing.** No overflow at 320px or with the WCAG 1.4.12
  overrides.
- **Forced colours.** Borders that carry meaning use `border-color: CanvasText`;
  the focus ring uses `Highlight`.
- **Reduced motion.** The site has no animation. The `prefers-reduced-motion`
  block neutralises anything added later, and the behaviour check asserts every
  transition is effectively off.
- **Document language.** `lang` is on `<html>` and on every element whose
  language differs.
- **Headings.** One `h1`, no skipped levels. Heading level is chosen for the
  outline, size comes from tokens.

Automated checks are indicators, not proof. `ACCESSIBILITY.md` section 6 lists
the manual and assistive technology testing that is still outstanding.

## 10. Motion

- No animation is used, and none is planned for phase 1.
- Permitted: a short (120ms) colour transition on hover and focus, because it
  confirms a control is live. That is the only motion in the stylesheet.
- Not permitted: parallax, autoplay, entrance animation, animated counters,
  loading skeletons, or anything that moves without user input.
- Anything added later must sit inside the reduced-motion guard and must not
  delay access to content.

## 11. Images and illustration

- **SVG for interface and brand marks.** `brand.njk` uses `currentColor` and
  `var(--paper)`, so the mark follows the theme. It carries a localized
  `<title>` and `<desc>` from `strings.yaml` and `role="img"`.
- **Decorative SVG is `aria-hidden="true"`** and `focusable="false"`, as the
  theme toggle icons are.
- **Photographs need a licence, a credit and alt text** before they are added.
  There are none in this phase; the two share cards in `src/img/` are the only
  raster assets.
- **No stock photography of "technology".** Hands on keyboards, server rooms
  and glitchy circuit boards are out. People, places and objects are in.
- **Illustration style, once there is any:** flat, warm, limited palette drawn
  from the tokens, no gradients, no drop shadows, no text baked into the image.
- **Do not copy international illustrations** without reading section 3 first.

## 12. Content presentation

- **Plain language.** Short sentences, active voice, concrete nouns. If a term
  needs a glossary, use a different term.
- **Link text describes the destination.** "Read the recipe", not "click here".
  The same words must be used in both languages.
- **Numbers carry a date.** "5 countries, 145 events" is meaningless without the
  observation date and the definition. Any statistic needs its source, its
  measurement definition and its date on the page.
- **Unverified is visible.** `.flag` on every unreviewed entry.
- **No fabricated participation.** No counters, no testimonials, no invented
  events.
- **Attribution travels with the claim.** Every ownership or headquarters claim
  links its source.

## 13. English and French

Both languages are equal. The build fails if a string or content field is
missing in either.

- **French typography.** A non-breaking space before `:`, `;`, `!`, `?` and
  inside `« »`. The `colon` string and `:lang(fr) .facts dt::after` rule handle
  the generated cases; hand-written French must use `\u00a0` too.
- **French runs 15–20% longer.** Components must not have fixed widths tuned to
  English. Test every component in both languages at 320px.
- **Link labels are translated**, not reused. `aria-label` values change with
  the interface language.
- **Untranslated is labelled.** The French review warning in
  `data/translations.lock.yaml` is the record; a page can show
  "Traduction pas encore révisée." That is correct, not a bug.
- **Proper nouns stay untranslated** — service names, company names, tokens.

## 14. Correct and incorrect usage

**Colour**

```css
/* Correct: the component names a role. */
.card { background: var(--surface); border-color: var(--rule); }

/* Incorrect: a raw value, invisible to the dark scheme and to the tests. */
.card { background: #fffcf5; border-color: #e2d8c6; }
```

**Buttons**

```html
<!-- Correct: one primary action, semantics from the element. -->
<a class="button button--primary" href="/en/recipes/">Start with a recipe</a>

<!-- Incorrect: two primaries, and a div pretending to be a link. -->
<div class="button button--primary" onclick="go()">Start</div>
<a class="button button--primary" href="/en/alternatives/">Alternatives</a>
```

**Headings**

```html
<!-- Correct: level follows the outline. -->
<h2>Components</h2>
<h3>Buttons</h3>

<!-- Incorrect: h4 to get a smaller size. Use a token on an h3 instead. -->
<h4>Buttons</h4>
```

**Notices**

```html
<!-- Correct: static text, no live region. -->
<div class="notice"><p>Subscriptions are cancelled on the provider's site.</p></div>

<!-- Incorrect: role="status" on content that was already there at load. -->
<div class="notice" role="status">Subscriptions are cancelled on the provider's site.</div>
```

**Focus**

```css
/* Correct: replace the ring, never remove it. */
:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }

/* Incorrect: makes keyboard navigation invisible. */
a:focus { outline: none; }
```

**Content**

```html
<!-- Correct: says what is known and what is not. -->
<p class="flag">Sample entry, not yet reviewed.</p>

<!-- Incorrect: presents an unverified claim as fact. -->
<p>Canada's most private cloud storage.</p>
```

## 15. Not built, and why

Phase 1 establishes tokens and the components that current pages need. The
following are specified by the roadmap but wait for their data, because CSS for
content that does not exist is untestable and drifts:

| Component | Waits for | Notes |
| --- | --- | --- |
| Monthly theme card | Phase 3 (`data/themes.yaml`) | `.card` plus a badge for the month |
| Event card | Phase 6 (`data/events.yaml`) | `.card` plus date and accessibility status |
| Organization card | Phase 5 (`data/initiatives.yaml`) | `.card` plus contribution category badges |
| International story card | Phase 4 (`data/global-stories.yaml`) | `.card` plus country label |
| Pagination and filtering | Content volume that needs it | Server-rendered first; no client-side filter until a page needs one |
| Poster and social templates | Phase 6 toolkit | SVG, generated from the same tokens |

Adding one of these means adding a modifier to `.card`, not a new layout.

## 16. How to change the system

1. Change a token in `src/_includes/css/tokens.css`, or a component in
   `src/_includes/css/components.css`. Never edit `_site/css/style.css`.
2. If a colour changes, run `npm test`. `test/tokens.test.js` fails if any
   documented pair drops below its threshold. Update the table in this file at
   the same time.
3. Open `/en/styleguide/` and `/fr/styleguide/` and look at the change in light
   and dark, at 320px and at desktop width.
4. Run `npm run check:a11y` and `npm run check:a11y:behaviour`.
5. If the change affects focus, motion or contrast, re-read section 9 against
   `ACCESSIBILITY.md` and update its change history.
