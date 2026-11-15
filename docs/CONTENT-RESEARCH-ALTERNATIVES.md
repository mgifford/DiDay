# Content research: filling the dead ends

Status: **research only.** Nothing in this file is published. It records what
was checked on 2026-11-14/15, what still needs evidence, and what the next
content PR should contain.

Why: nine of the fifteen cancellation entries currently end at "No reviewed
alternative yet" — Amazon Prime, Prime Video, Audible, Apple TV+, YouTube
Premium, Microsoft 365, ChatGPT Plus, Amazon Grocery, Paramount+. They fall
into five missing categories.

The rules for listing are unchanged: Canadian owned, open source, or European
owned, ranked in that order, with a source for every claim. A vendor's own
marketing is not a source for ownership.

---

## 1. Email — the gap is smaller than I said

I told you there was no good Canadian email option. **That was wrong.**

| Candidate | What was confirmed | Status |
| --- | --- | --- |
| **Web Networks** (`web.net`) | "Not-for-profit Canadian IT Solutions", founded **1987**, **worker co-op**, "FOSS First Philosophy"; sells `@web.net` email at $5/month and states it does not sell data. Source: <https://web.net/> and <https://web.net/about> | **Strong.** Canadian, cooperative, long-running, sells exactly the service the recipe needs |
| **National Capital FreeNet** (`ncf.ca`) | Member-based non-profit in Ottawa: internet, email, workshops, digital-equity work, community access fund. Source: <https://www.ncf.ca/> | **Strong for Ottawa**, and honest to label as local |
| Proton Mail | Swiss, open source, already listed | Unchanged |

**What this means:** the email recipe can offer a Canadian co-op first, with
Proton Mail as the open-source Swiss option. That is a better answer than
"Switzerland or nothing", and it is exactly the kind of organization the
ecosystem directory describes — a Canadian organization providing public
infrastructure rather than a product.

**Still needed before listing:** whether Web Networks' co-op ownership is
described on a page a reader can check (the homepage says "Worker Co-Op"), and
whether NCF is member-owned or board-governed. Both are one page each.

## 2. Video — four dead ends, and a strong Canadian category

| Candidate | Evidence | Status |
| --- | --- | --- |
| **Knowledge Network** (`knowledge.ca`) | Owned by the **Knowledge Network Corporation, a Crown corporation of the Government of British Columbia**; free, publicly funded educational streaming. Source: Wikipedia, secondary | **Strong.** You suggested it; it is Canadian-owned and free |
| CBC Gem | CBC is a Crown corporation (identity already sourced on this site's reference list) | Strong, needs its own source line |
| ICI TOU.TV | Radio-Canada, French-language | Strong, needs a source line |
| Crave | Bell Media (BCE) | Needs ownership confirmation |
| Jellyfin | Open source media server, self-hosted | Strong via open source |
| PeerTube | Open source federated video, Framasoft (France) | Strong via open source |

All six resolve with sensible titles (checked 2026-11-14). This is the best
filled category of the five: three Canadian public broadcasters plus two
open-source options.

## 3. Office — clean

| Candidate | Evidence | Status |
| --- | --- | --- |
| **LibreOffice** | Document Foundation, Germany, open source | Strong |
| **Collabora Online** | UK, open source | Strong |
| **Nextcloud Office** | Germany, open source; Nextcloud is already listed | Strong |
| **CryptPad** | France, open source, end-to-end encrypted | Strong |

No Canadian option exists in this category, which is worth saying on the page
rather than leaving as an absence.

## 4. AI — the Cohere question, answered as far as it can be

You asked whether Cohere is Canadian-owned or merely headquartered in Toronto.

- Wikipedia describes it as "a Canadian multinational technology company …
  headquartered in Toronto". Privacy policy: mailing address 171 John Street,
  Toronto; entity "Cohere Inc.". Terms: content "protected by copyright in
  Canada".
- **None of those state where the company is incorporated or who owns it.**
  Cohere is privately held; its investors are not a single national owner.

So under this site's rules it is `headquarters: CA`, `ownership: null` — which
means an exception or a draft, not a Canadian listing. That is the same
distinction that caught Hushmail, and it is worth showing rather than hiding.

| Candidate | Evidence | Status |
| --- | --- | --- |
| **Ollama** | Open source; runs models locally | Strong via open source |
| **Mistral** (Le Chat) | France; open-weight models | Strong via European ownership |
| Cohere | Toronto HQ, ownership not established | Exception, or leave out |

## 5. Audiobooks — still weak

Library audiobooks through a public library card are the honest answer, and
Kobo audiobooks is Japanese-owned (already an exception in this category).
No Canadian-owned audiobook service was found. **Recommendation:** no new
listing; point Audible at the existing library alternative and be explicit
that the paid audiobook market has no Canadian option.

## 6. Shopping — not a service switch

Amazon Prime and Amazon Grocery are habits, not subscriptions to a product
that has an alternative. **Recommendation:** a recipe, "Shop without Amazon",
covering local stores, co-ops and CSA boxes, rather than an alternative entry.
This is also the most honest treatment: there is no Canadian replacement for
Amazon's logistics, and pretending otherwise would be the kind of claim the
editorial policy exists to prevent.

## 7. Proposed next PR

1. **Four new categories:** video streaming, office suite, AI assistants, and
   (for the co-op ISPs) keep everything under email.
2. **New alternatives:** Web Networks, National Capital FreeNet, Knowledge
   Network, CBC Gem, ICI TOU.TV, Jellyfin, PeerTube, LibreOffice, Collabora
   Online, CryptPad, Ollama, Mistral — each with headquarters, ownership,
   open-source status, a bilingual note and a source.
3. **Three recipes:** video without Prime Video or Apple TV+, documents
   without Microsoft 365, and a chat-AI recipe that is honest about what it
   cannot replace.
4. **One recipe, not an alternative:** shop without Amazon.
5. **Wire the nine dead ends** to the above, or to the library alternative for
   Audible.
6. **Remove Hushmail from the email recipe** (your call) — it stays in the
   catalogue with its exception, but the recipe offers the Canadian co-op and
   Proton Mail instead.

## 8. What still needs a person, or more source work

| Item | Why |
| --- | --- |
| Web Networks ownership page | The homepage says "Worker Co-Op"; a citable page would be better |
| NCF governance | Member-owned or board-governed changes how it is described |
| Crave ownership | Bell Media / BCE — needs a source line |
| CBC Gem, ICI TOU.TV | Crown corporation status needs a source line each |
| Cohere | Incorporation jurisdiction and ownership are not on any page read |
| French | Every new entry needs a French note; the backlog is already 326 |

## 9. Method note

Everything above was checked by reading the page, not by a status code. The
candidates that resolved are listed with what their own site or an
encyclopaedic source says — which is enough for identity and not enough for an
ownership claim in every case.
