# Contributing

## Adding an alternative

Add an entry to `data/alternatives.yaml`:

```yaml
- id: example-service
  name: Example Service
  url: https://example.ca/
  category: email
  headquarters: CA
  ownership: CA
  open_source: false
  notes:
    en: One or two plain sentences.
    fr: Une ou deux phrases simples.
  sources:
    - title: Company registration or About page
      url: https://example.ca/about
      supports: [headquarters, ownership]
  verified: false
```

Rules:

- An alternative is listed if it is **Canadian owned**, **open source**, or **European owned**, and is ranked in that order. Ownership decides, not headquarters.
- "European" is defined in `data/regions.yaml`. It includes Ukraine, the UK, Switzerland and the Western Balkans.
- Services owned in Russia, Belarus or China (including Hong Kong and Macao) are never listed. No exception overrides this.
- Anything else needs a bilingual `exception` explaining why it is listed. Exceptions are labelled on the site and ranked last.
- Use `draft: true` to keep an entry out of the site while you research it.
- `headquarters` and `ownership` use two-letter country codes. Use `null` when you do not know.
- Every claim needs a source that supports it. List the claims under `supports`: `headquarters`, `ownership`, `open_source`. Use `supports: []` for background sources.
- Company "About" pages, corporate registries and annual reports are preferred over news articles.
- Leave `verified: false` and leave out `last_reviewed`. A maintainer sets both after checking the sources.

## Naming companies

Describe what a company does and link a source. Do not add claims about a company's conduct without a published, citable source.

## Adding a navigation item

Navigation is data. Add the page first, then add an entry to `data/nav.yaml`
with a stable `id`, a label in both languages, and either a `url` or
`children`. Keep a group to five children or fewer, and keep the top level to
seven items. Read [docs/INFORMATION-ARCHITECTURE.md](docs/INFORMATION-ARCHITECTURE.md)
before changing the structure.

## Adding a monthly theme

Add an entry to `data/themes.yaml` with a `month` from 1 to 12, a bilingual
`title`, `summary` and `action`, and optional `recipes` and `alternatives`
references. Never copy a recipe's text into a theme: link to it by `id`.

The homepage shows the theme for the month of the next first Sunday. If a month
has no theme, the homepage hides the section and the build prints a warning.
There must be exactly one theme per month number.

## Changing the look of the site

Style lives in `src/_includes/css/`. Change a token in `tokens.css` before
changing a component in `components.css`, and never edit `_site/css/style.css`,
which is generated.

- Colours, type sizes and spacing are tokens. Components reference tokens, not
  raw values, so one change reaches the light scheme, the dark scheme, the
  reader-mode colours and the styleguide together.
- Every foreground/background pair in `docs/DESIGN-SYSTEM.md` is asserted by
  `test/tokens.test.js`. If a change breaks one, `npm test` fails and names the
  pair.
- Add a component only when a pattern is used more than once. Extend `.card`
  with a modifier rather than inventing a second card.
- Look at `/en/styleguide/` and `/fr/styleguide/` in light and dark, at 320px
  and on a desktop before you open a pull request.

Read [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) for the rules, the tested
contrast table, and the components that deliberately do not exist yet.

## Checking your change

```sh
npm test
```

The content check lists every problem with its location, for example `alternatives.example-service: needs at least one source`.

For changes that affect HTML, CSS or JavaScript, also run:

```sh
npm run check:a11y            # axe-core, light and dark, desktop and phone
npm run check:a11y:behaviour  # keyboard, focus, reflow, text spacing, forced
                              # colours, reduced motion, navigation groups
```

Both run in CI on every pull request. Then follow the definition of done in
[ACCESSIBILITY.md](ACCESSIBILITY.md).
