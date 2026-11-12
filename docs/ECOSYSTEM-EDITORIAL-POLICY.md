# Canadian ecosystem directory: editorial policy

Status: **phase 5, PR 1.** The directory itself is not built yet. This policy
exists first so the rules are settled before there is a catalogue to argue
about. The rules here are implemented in `lib/initiatives.js` and tested in
`test/initiatives.test.js`; if a rule changes, change both.

Related documents: `docs/ECOSYSTEM-RESEARCH.md` (the inventory and its
sources), `docs/ECOSYSTEM-SCHEMA.md` (the record format),
`docs/INFORMATION-ARCHITECTURE.md` (where the pages sit).

---

## 1. What this directory is

A record of Canadian organizations whose work makes digital technology more
open, independent, resilient or publicly accountable — **including work on
projects that are not Canadian and not owned by them**.

It answers one question:

> Who is helping build and sustain more independent digital infrastructure?

It does not answer "what should I use instead?", which is
`data/alternatives.yaml`, and it is not a list of Canadian-owned products.

## 2. What it is not

- **Not an endorsement.** Inclusion is not a recommendation, a partnership, a
  certification, or a statement that an organization is good.
- **Not a ranking.** There is no score, no league table, and no ordering by
  size, funding or fame.
- **Not a product catalogue.** A company's inclusion does not qualify any of
  its products for the alternatives directory, which keeps its own rules.
- **Not a certification scheme.** Where a standard applies (Digital Public
  Goods Standard, `publiccode.yml`) the directory links to it and does not
  invent a competing one.
- **Not paid placement.** No organization can pay for inclusion, position or
  featured status. See section 10.

## 3. Inclusion criteria

An organization is listed when **all** of these hold:

1. **A Canadian connection, with evidence.** One of:
   - `headquartered` — main office in Canada;
   - `canadian-operations` — a substantive Canadian office or team, where the
     work being described involves that team;
   - `canadian-led-project` — the project itself is led from Canada;
   - `canadian-members` — a Canadian membership organization or chapter.
2. **At least one documented contribution**, with a source that supports the
   specific claim (section 5).
3. **A category**, from the list in the schema.
4. **A summary in both languages.**

`country: CA` is required. Being globally headquartered elsewhere but having
Canadian contributors is not enough on its own — see the attribution rule.

## 4. Exclusion criteria

- **No evidence of contribution**, even if the organization is well known,
  Canadian, or says so in its marketing.
- **Only an individual's volunteer work.** A person contributing upstream in
  their own time does not establish that their employer contributes. The
  employer may be listed only if there is evidence the work was supported or
  performed on the employer's behalf.
- **Ownership as the only claim.** "Canadian-owned" is not a contribution and
  is not one of the connection types in the schema.
- **Marketing language as the only source.** "We are committed to open
  source" is not evidence of a contribution.
- **Indigenous-led work described on non-Indigenous terms.** See section 8.
- **Political parties, campaigns for office, or organizations whose primary
  purpose is unrelated to digital technology.**

## 5. Evidence standards

**Primary sources first:** upstream repositories, maintainer and release
records, foundation governance documents, published contribution reports,
procurement and grant disclosures, the organization's own legal or about page
for identity questions.

**Secondary sources** (news, Wikipedia) are acceptable for identity and
location when the primary source is unreachable, and are marked as secondary
in the research inventory. They are never sufficient for a contribution claim.

**What is not evidence:**

- commit counts, star counts or repository counts on their own — volume is not
  impact;
- a logo on a project's website;
- an employee's personal GitHub activity (see the attribution rule);
- a successful HTTP request. A link check proves a page exists, not that it
  supports the sentence above it. **Nothing in this directory is marked
  verified by an automated check.**

**Every contribution claim carries its own source**, separately from the
record-level sources, so a weak claim cannot hide behind a strong one.

## 6. Editorial states

| State | Meaning | Requirement |
| --- | --- | --- |
| `listed` | Documented Canadian connection and a place in the ecosystem. | Section 3 criteria |
| `documented-contributor` | There is a source showing the contribution described. | At least one contribution with a source that names the specific work |
| `featured: true` | A maintainer selected this organization to illustrate one specific contribution. | `documented-contributor`, plus a bilingual `featured_rationale` |

**Featured is not a rank.** It is a selection, the way a magazine picks a
photograph. The rationale must say what the organization did, not how large or
well known it is, and it is published on the page.

An organization may be featured for one contribution and not for another. If a
maintainer cannot write the rationale without superlatives, it is not a
featured example.

## 7. Review and correction

- **Review window:** 12 months, recorded in `last_reviewed`, matching the other
  content collections. `scripts/check-reviews.js` flags overdue records; the
  existing monthly automation opens an issue.
- **Any correction wins over the original listing.** Report a problem through
  the same routes as the rest of the site (`report.njk`), or open an issue.
- **Removal** happens when: the contribution evidence disappears; the
  organization asks to be removed; the Canadian connection ends; or the entry
  cannot be kept accurate. Removals are recorded in the pull request and in
  the change history of this file.
- **Archival rather than silent deletion** where a listing has been public for
  a year or more; the record stays in the file with `archived: true` in a
  later schema revision, if that becomes necessary.

## 8. Indigenous data sovereignty

Indigenous-led initiatives appear on their own terms, not as an example of
Canadian national sovereignty.

- Describe the work and the governance model the organization itself states.
- Reference First Nations principles of OCAP® where the organization does, and
  do not paraphrase them into a general data-rights frame.
- Do not imply endorsement, partnership, or representation of First Nations by
  this project. The directory links; it does not speak for anyone.
- Do not group Indigenous initiatives with "Canadian organizations" in a way
  that treats Indigenous sovereignty as a subset of Canadian sovereignty.

## 9. Conflicts of interest

Maintainers may have professional relationships with listed organizations.
Where a relationship could reasonably be seen to affect an editorial decision
(inclusion, category, featured status), it is disclosed in the pull request and
in the change history of this file.

Rules:

- Do not review or approve an entry for your own employer without another
  maintainer's sign-off.
- Featured selections are proposed with a written rationale that another
  maintainer can check.
- No maintainer may accept payment, gifts or services in exchange for
  inclusion or position.

## 10. Sponsorship and commercial influence

- Inclusion and position cannot be bought.
- Sponsors of this project, if any, are listed separately and gain no
  editorial influence.
- Funding relationships between a listed organization and an open-source
  project are legitimate content *when sourced*; they are recorded as a
  contribution of type `funding`, with the commitment distinguished from
  verified expenditure.

## 11. Relationship to the datasets that already exist

| Dataset | Question it answers | Overlap rule |
| --- | --- | --- |
| `data/alternatives.yaml` | What could I use instead? | An organization may appear in both. The initiative record links with `relationships.alternatives`; product suitability keeps its own rules. |
| `data/campaigns.yaml` | Who else is campaigning on this? | If an organization is already there, the initiative summary must describe its *contribution*, not restate its mission. Do not maintain two versions of the same description. |
| `data/global-stories.yaml` | Who is doing this outside Canada? | International only. A Canadian organization belongs here, not there. |
| `data/themes.yaml` | What should I do this month? | Themes link to initiatives with `relationships.themes`; a theme does not repeat an organization's description. |

Resolved on 2026-11-12: OpenMedia and C4DS moved out of `campaigns.yaml` into
`data/initiatives.yaml`, as DI.DAY Germany and Doeidag were moved in phase 4.
One description, one place.

## 12. Where the rules live

- `lib/initiatives.js` — the enums and `validateInitiative()`, the executable
  form of sections 3, 5, 6 and 7.
- `test/initiatives.test.js` — a test per rule, so a rule cannot be relaxed by
  accident.
- `scripts/validate.js` — runs the validator over the data once PR 2 adds it.

## 13. Limitations

- A directory of this kind measures what can be sourced, not what matters
  most. Quiet maintenance work with no public record will be under-represented.
- The evidence standard favours organizations with the capacity to publish
  their contributions, which skews toward larger and better-funded ones.
- Nothing here establishes that a listed organization is trustworthy, secure,
  accessible, or well governed. Inclusion is a statement about a documented
  contribution, not a judgement of the organization as a whole.
