# Canadian ecosystem research inventory

Status: **phase 5, PR 1.** Research only. Nothing here is published, and no
organization in this file has been approved as a listing.

This inventory is deliberately wider than the directory will be. Its job is to
record what the evidence supports, what it does not, and what still needs a
person to check.

Rules that govern publication: [ECOSYSTEM-EDITORIAL-POLICY.md](ECOSYSTEM-EDITORIAL-POLICY.md).
Record format: [ECOSYSTEM-SCHEMA.md](ECOSYSTEM-SCHEMA.md).

**Research date: 2026-11-12.** Everything below was checked that day. Sites
change; re-check before publishing.

---

## 1. Method

Candidates came from the roadmap's leads, plus organizations found through the
sources themselves. For each one I tried to establish, from its own site or
another stable source:

1. What it is and who runs it.
2. Its Canadian connection, with a URL that says so.
3. At least one **specific** contribution, not a claim to care about open
   source.

Two sources were unreachable to automated requests (CIRA, FNIGC — both sit
behind bot protection). They are marked **secondary only** and need a person
to confirm against the primary site. A successful page load is not evidence
anyway; the claim still has to be checked by reading it.

## 2. What "verified" means here

| Mark | Meaning |
| --- | --- |
| **A — identity confirmed** | The organization, its type and its Canadian connection are confirmed from a source named below. |
| **B — contribution confirmed** | A specific contribution is confirmed from a source that names the work. |
| **C — needs a person** | Something material is unconfirmed. Not publishable yet. |

An organization needs **A + B** to be listed as `documented-contributor`, and
A + B + a written rationale to be featured.

## 3. Candidates with confirmed identity

These have a confirmed Canadian connection. The last column is what is still
missing before publication.

| Organization | Type | Canadian connection | Source for identity | Evidence |
| --- | --- | --- | --- | --- |
| **OpenMedia** | non-profit | Headquartered in Vancouver, BC | <https://openmedia.org/about> (registered non-profit), <https://openmedia.org/contact> (mailing address) | A |
| **Canadian Internet Registration Authority (CIRA)** | non-profit | Ottawa, ON; manages `.ca` | Wikipedia, secondary: <https://en.wikipedia.org/wiki/Canadian_Internet_Registration_Authority>. `cira.ca` blocked automated requests | A (secondary) |
| **eQualitie** | non-profit | Headquarters in Montreal | <https://equalitie.org/about/> and its footer; Wikipedia confirms Montreal | A |
| **Code for Canada** | non-profit | National Canadian non-profit, founded 2017 | <https://codefor.ca/about> | A |
| **Canadian Digital Service (CDS)** | public-sector | A team inside the Government of Canada | <https://digital.canada.ca/> | A |
| **Koumbit** | cooperative | Self-managed non-profit collective, Montreal/Tio'tia:ke | <https://koumbit.org/> | A |
| **Evolving Web** | company | Montreal, QC | <https://evolvingweb.com/contact> (4388 rue Saint Denis, Montreal) | A |
| **Savoir-faire Linux** | company | Canada (org location), associated with Jami | <https://api.github.com/orgs/savoirfairelinux> (location "Canada", 367 public repos), <https://jami.net/> (names Savoir-faire Linux) | A |
| **First Nations Information Governance Centre (FNIGC)** | non-profit | Ontario; First Nations data sovereignty, OCAP® | Wikipedia, secondary: <https://en.wikipedia.org/wiki/First_Nations_Information_Governance_Centre>. `fnigc.ca` blocked automated requests | A (secondary) |
| **Canadians for Digital Sovereignty (C4DS)** | non-profit coalition | Canadian coalition of organizations and individuals | <https://c4ds.ca/> | A |

## 4. Candidates that still need work

| Organization | What is known | What is missing | Status |
| --- | --- | --- | --- |
| **Open North** | Not-for-profit working on open data with governments; site reads as Canadian | No Canadian location statement found on the pages read | C |
| **ImageX** | Drupal agency; about page read | No address or Canadian statement found yet; check the contact and legal pages | C |
| **Shopify** | 1,239 public repositories (GitHub org API) | A specific contribution to shared infrastructure (not product tooling), with a source | C — volume alone is not evidence |
| **Internet Society Canada Chapter** | `isoc.ca` responds but returned no readable content | Whether it is active, and what it contributes | C |
| **Digital Public Goods Alliance** | Global initiative; the Government of Canada's participation is plausible | A source showing Canadian participation | C — reference material, not a candidate |

## 5. Not eligible as Canadian entries

| Organization | Why |
| --- | --- |
| **Acquia** | US-owned and US-headquartered. Under the policy, `canadian-operations` could apply **only** if the described work involves a Canadian team and a source says so. Corporate ownership elsewhere is not a Canadian connection. |
| **CivicActions** | Location unconfirmed: the site blocked automated requests. Do not assume it is Canadian because it appears in a Canadian roadmap. Needs a source before it can be considered at all. |

The attribution rule applies to both: a Canadian employee's volunteer upstream
work is not evidence that the employer contributes.

## 6. Contribution evidence: what to check before publishing

Identity is the easy part. This is the work PR 2 actually has to do, per
organization, from the sources named above and their repositories.

| Organization | The contribution claim that needs a source |
| --- | --- |
| OpenMedia | Campaign or technical work with a published record (e.g. a submission to a government consultation on interoperability or device locking) |
| CIRA | Community Investment Program grants to open/infrastructure projects, or its involvement in internet governance bodies — with a published list |
| eQualitie | A named open-source tool it maintains (Deflect, Ceno, Ouisync) with a repository and a licence |
| Code for Canada | A published piece of reusable public-sector software, or its fellowship/delivery record |
| CDS | A named repository under `cds-snc` that is reused by other governments, with a licence |
| Koumbit | Hosting or maintenance of a named free-software service; cooperative governance |
| Evolving Web | Documented upstream contributions to Drupal or WordPress, not "we build with Drupal" |
| Savoir-faire Linux | Its role maintaining Jami, with a repository and a licence statement |
| FNIGC | Publication of the OCAP® principles and First Nations data governance work, described in its own terms |
| C4DS | Its published position or coalition work on digital sovereignty, with the member organizations named |

If a claim cannot be sourced, the organization is not listed. That is the
intended outcome, not a failure of the research.

## 7. Proposed first publication set

Ten organizations, subject to the section 6 checks:

> OpenMedia · CIRA · eQualitie · Code for Canada · Canadian Digital Service ·
> Koumbit · Evolving Web · Savoir-faire Linux · FNIGC · C4DS

This is deliberately small and deliberately mixed: three digital-rights and
policy bodies, two public-sector teams, one cooperative, two companies that
contribute upstream, one Indigenous data-governance body. It demonstrates that
"Canadian digital independence" is not one kind of organization.

**Featured examples: at most two in the first version.** Suggested, subject to
maintainer approval: eQualitie (a Canadian organization maintaining
internationally used censorship-resistance tools) and Koumbit (a worker
cooperative running infrastructure on cooperative terms). Both would need a
written rationale — see the policy, section 6.

## 8. Overlaps with the existing datasets

| Dataset | Overlap | Decision needed |
| --- | --- | --- |
| `data/campaigns.yaml` | **OpenMedia** and **C4DS** are already there, described for the About page | Move them into the directory (as DI.DAY Germany and Doeidag were moved in phase 4), or keep the campaign text on About and write a contribution-focused summary here. **Maintainer decision.** |
| `data/alternatives.yaml` | None of these organizations is a listed alternative product | No change. Products keep their own rules; an organization here does not qualify a product there. |
| `data/global-stories.yaml` | None — international only | No change. |
| `data/themes.yaml` | January, June, July, September, October and November themes could each link to relevant initiatives | PR 4 work; the schema already supports `relationships.themes`. |

## 9. Open questions for the maintainer

1. **OpenMedia and C4DS**: move out of `campaigns.yaml`, or keep both entries
   with different purposes? Section 11 of the editorial policy allows either,
   but not both descriptions drifting.
2. **CIRA and FNIGC**: both primary sites block automated requests. Someone
   needs to confirm identity and contribution by hand; the inventory currently
   rests on Wikipedia for identity only.
3. **Public-sector inclusion**: CDS is part of the Government of Canada. Is a
   government team an "organization" for this directory, or should the
   directory stay civil-society and private sector? The policy currently allows
   `public-sector`.
4. **Featured count**: is two right for a first version, or should the first
   release have none until the directory has been through a review cycle?
5. **French review**: all new editorial text will arrive in French, but the
   project's French backlog is already 265 texts. Does the directory wait for a
   reviewer, or ship with the "not yet reviewed" marker like the rest of the
   site?

## 10. Limitations of this inventory

- **It is not exhaustive.** It covers the roadmap's leads plus what they led
  to. Canadian open-source work is larger than this, and quiet maintainers are
  under-represented because they have no marketing page.
- **Wikipedia is doing real work here** for two organizations. That is
  acceptable for identity and not acceptable for a contribution claim.
- **Two primary sites were unreachable** to automated requests. Nothing in this
  document asserts anything about them beyond what a secondary source says.
- **No organization has been contacted.** Nothing here implies participation,
  endorsement or partnership.
