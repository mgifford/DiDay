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

## Checking your change

```sh
npm test
```

The content check lists every problem with its location, for example `alternatives.example-service: needs at least one source`.
