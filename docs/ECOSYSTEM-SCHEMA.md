# Canadian ecosystem directory: record schema

Status: **phase 5, PR 1 — proposed, not yet in use.** The validator exists and
is tested; `data/initiatives.yaml` lands in PR 2. This document and
`lib/initiatives.js` must stay in step.

The rules behind every field are in
[ECOSYSTEM-EDITORIAL-POLICY.md](ECOSYSTEM-EDITORIAL-POLICY.md).

---

## Why the schema is small

Every field is a promise to keep something accurate. A field that cannot
realistically be maintained is worse than no field, because it goes stale and
quietly undermines the entries around it.

So this version deliberately omits:

| Omitted | Why |
| --- | --- |
| A sovereignty score or ranking | Not meaningful, easy to game, impossible to defend |
| Employee counts, revenue, valuation | Irrelevant to contribution and a maintenance burden |
| Commit, star or contributor counts | Volume is not impact; the policy says so explicitly |
| Logos | Licensing work, no informational gain, and the directory must work without them |
| Social media handles | Churn, and they are on the organization's own site |
| Free-text "impact" fields | Unfalsifiable; the contribution records carry the claim |

## The record

```yaml
- id: example-organization        # stable slug, used in URLs
  name: Example Organization
  website: https://example.org/
  country: CA

  organization_type: non-profit   # one value

  categories:                     # one or more
    - digital-rights
    - open-governance

  summary:
    en: One or two sentences on what it contributes, not what it sells.
    fr: Une ou deux phrases sur ce qu'elle apporte, pas sur ce qu'elle vend.

  canadian_connection:
    type: headquartered           # one value
    evidence: https://example.org/about

  contributions:                  # at least one
    - project: null               # id in projects.yaml, or null for now
      type: public-infrastructure
      description:
        en: The specific work, named plainly.
        fr: Le travail précis, nommé simplement.
      sources:
        - https://example.org/report

  relationships:
    alternatives: []              # ids in data/alternatives.yaml
    campaigns: []                 # ids in data/campaigns.yaml
    themes: []                    # ids in data/themes.yaml

  sources:                        # evidence for the record as a whole
    - url: https://example.org/about
      supports:
        - organization_type
        - canadian_connection

  status: listed                  # listed | documented-contributor
  featured: false
  featured_rationale: null        # required when featured is true

  verified: false
  last_reviewed: null             # YYYY-MM-DD, set by a maintainer
```

## Fields

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `id` | string | yes | Lower-case words joined by hyphens. Stable; it appears in URLs and in other datasets' relationships. Never reuse an id for a different organization. |
| `name` | string | yes | Official name as the organization writes it. |
| `website` | string | yes | `https://`. The organization's own site, not a profile page. |
| `country` | string | yes | `CA` only. The directory is specifically Canadian. |
| `organization_type` | enum | yes | See below. One value. |
| `categories` | list of enum | yes | At least one. See below. |
| `summary` | `{en, fr}` | yes | What it contributes. Not a mission statement. |
| `canadian_connection.type` | enum | yes | See below. |
| `canadian_connection.evidence` | string | yes | `https://` URL that supports the connection claimed. |
| `contributions` | list | yes | At least one. Each entry is a claim with its own evidence. |
| `contributions[].project` | slug or null | no | Id in `data/projects.yaml`. See "Projects" below. |
| `contributions[].type` | enum | yes | See below. `advocacy` exists because a digital-rights organization contributes published analysis and campaigning, not code. |
| `contributions[].description` | `{en, fr}` | yes | The specific work, not "uses open source". |
| `contributions[].sources` | list of URL | yes | At least one `https://` URL per contribution. |
| `relationships.alternatives` | list of id | no | Must exist in `data/alternatives.yaml`. |
| `relationships.campaigns` | list of id | no | Must exist in `data/campaigns.yaml`. |
| `relationships.themes` | list of id | no | Must exist in `data/themes.yaml`. |
| `sources` | list of `{url, supports}` | yes | At least one. `supports` names what the URL backs. |
| `status` | enum | yes | `listed` or `documented-contributor`. |
| `featured` | boolean | yes | `true` only with `documented-contributor` and a rationale. |
| `featured_rationale` | `{en, fr}` or null | no | Required when `featured` is true; forbidden when false. |
| `verified` | boolean | no | `true` only with `last_reviewed`, set by a maintainer. |
| `last_reviewed` | date or null | no | `YYYY-MM-DD`, not in the future. 12-month window. |

`null` means "not known". It never means "none" and never means "failed". An
organization with no known funding relationship is not a worse entry than one
with a documented grant.

## Enumerations

**`organization_type`** — `non-profit`, `cooperative`, `company`,
`public-sector`, `foundation`, `community-group`.

**`categories`** — what the organization contributes:

| Value | Covers |
| --- | --- |
| `open-source-development` | Code, documentation, accessibility, testing, security, release engineering |
| `funding` | Sponsorship, foundation membership, grants, upstream engineering time |
| `open-governance` | Foundation governance, standards participation, open protocol work |
| `public-infrastructure` | Digital public goods, open government services, reusable public-sector software |
| `digital-rights` | Privacy, internet governance, literacy, connectivity, democratic oversight |
| `indigenous-data-sovereignty` | Indigenous-led data governance, on the organization's own terms |

**`canadian_connection.type`** — `headquartered`, `canadian-operations`,
`canadian-led-project`, `canadian-members`. There is deliberately **no**
`canadian-owned`: ownership is a corporate fact, not a contribution.

**`contributions[].type`** — `upstream-development`, `maintenance`,
`documentation`, `accessibility`, `security`, `funding`, `governance`,
`standards`, `hosting`, `training`, `public-infrastructure`. There is
deliberately **no** `commit-count`.

## Projects: deferred, with a trigger

`data/projects.yaml` was considered and is **not** part of PR 1 or PR 2.

The researched shortlist does not yet justify it: fewer than three
organizations share more than one project, so a project collection would hold
two or three records with a single relationship each. That is a join table
with nothing to join.

Until it exists, `contributions[].project` stays `null` and the project is
named in `description` ("Contributions to Drupal core…"). The validator
accepts an id in `project` only if it is in the project set passed in, so when
the file arrives the field starts enforcing itself with no schema change.

**Trigger to create it:** three or more organizations contributing to the same
two or more projects, or a project needing its own governance and licence
metadata more than once.

When it does arrive, `data/projects.yaml` would carry: `id`, `name`,
`website`, `repository`, `licence`, `governance`, `standards`, `sources`,
`verified`, `last_reviewed`. An organization's presence must never imply it
owns or governs the project.

## How the schema avoids duplicating existing datasets

- **Alternatives** describe products and their suitability. An initiative
  describes organizational contribution. `relationships.alternatives` links
  them; nothing is copied.
- **Campaigns** describe who is campaigning. Where an organization is in both,
  the initiative summary is about contribution and the campaign entry keeps
  the mission text. The overlap decision for the two current cases is an open
  question in `docs/ECOSYSTEM-RESEARCH.md`.
- **Themes** reference initiatives by id. A theme page shows the organization
  name and a link, not a second description.
- **Global stories** are international only; a Canadian organization belongs in
  this file.

## Validation

`lib/initiatives.js` exports the enums, `validateInitiative(record, context)`
and `validateInitiatives(records, context)`. The context is the id sets of the
other collections, so a relationship to a deleted record fails the build
instead of producing a dead anchor.

Every rule in this document has a test in `test/initiatives.test.js`. PR 2
wires the same functions into `scripts/validate.js`; nothing about the rules
changes at that point.
