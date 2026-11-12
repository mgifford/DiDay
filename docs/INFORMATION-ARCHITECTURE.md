# Information architecture

The site's navigation is data, not markup: `data/nav.yaml` is the source, and
`src/_includes/nav.njk` renders it. This document explains how it is organised,
what is deliberately not there yet, and how to add to it.

Status: **phase 2 of 6.** The structure below describes what ships today and
where each later phase slots in.

---

## 1. Principles

1. **Task first, content type second.** A visitor arrives wanting to *do*
   something — move a service, host a session, find out what this is. The
   labels describe the task, not the database table behind it.
2. **No dead links.** An item appears only when its page exists. The internal
   link check fails on a link to a page that is not built, so `data/nav.yaml`
   grows one phase at a time rather than pointing at intentions.
3. **Shallow by default.** Two levels maximum: a top-level item, and a short
   panel under it. Anything that needs a third level needs a landing page with
   its own headings instead.
4. **Every language its own label.** Labels are bilingual data, and French is
   written, not translated word-for-word from English.
5. **Works without JavaScript.** A group is a `<details>` disclosure. Script
   adds Escape and close-on-outside; it is not required to open a menu or
   follow a link.

## 2. Structure today

```
/                       language chooser (no nav)
/en/, /fr/
├── Take action ▾
│   ├── Switch recipes  .. /recipes/
│   ├── What to cancel  .. /cancel/
│   ├── Alternatives    .. /alternatives/
│   └── Monthly themes  .. /themes/
├── Around the world .... /world/
├── About ............... /about/
└── (footer) Design system ... /styleguide/
```

Three top-level items, one of them a group with four children. The homepage carries the
participation paths (this month's theme, how participation works, around the
world, in Canada, resources) as page sections rather than as navigation
entries, because they are the page's argument rather than separate
destinations.

**Footer:** social links, GitHub, licence, and the design system reference.
The styleguide is a contributor document; it is linked from About as well.

## 3. Target structure

Each row ships when its page exists. The phase column is the roadmap phase that
creates it.

| Top-level | Ships | Children | Notes |
| --- | --- | --- | --- |
| Home | now | — | Also the site name link |
| Take action | now | Switch recipes, What to cancel, Alternatives | |
| Monthly themes | **now**, as a child of Take action | Twelve theme pages | `/themes/` index plus `/themes/<id>/` |
| Around the world | **now**, as a single page | International campaigns and events share the page until there is enough for a section | `/world/` |
| Canada | phase 5 | Organizations, Open-source projects | `/canada/` |
| Get involved | phase 6 | Organize an event, Community stories, Organizer toolkit | `/get-involved/` |
| About | now | — | Adds campaigns, evidence, how the site is built |

That is seven items, which is the ceiling. Beyond seven, the row stops being
scannable at 320px and the header becomes a menu button. If a phase needs an
eighth destination, it belongs inside an existing group.

### Where things live, by question

| Visitor question | Destination |
| --- | --- |
| What is this? | Home, then About |
| What can I do right now? | Take action, or the hero's primary button |
| What is this month about? | Home section, later `/themes/<current>/` |
| Who else is doing this? | Around the world; Canada (phase 5) |
| How do I bring other people in? | Get involved (phase 6) |
| How do I report a problem? | Every entry, plus About |

## 4. Why a disclosure, not a menubar

Considered and rejected:

- **`role="menubar"` / `role="menu"`.** This is an application menu pattern.
  It needs arrow-key handling, roving tabindex, type-ahead and a lot of script,
  and it is frequently announced to screen reader users as a menu application,
  which sets the wrong expectation for a set of ordinary links.
- **CSS `:hover` dropdowns.** Unreachable by keyboard, unreachable on touch,
  and they close when the pointer moves the wrong way.
- **A hamburger button at every width.** Hides the site's main content behind
  a control, and needs script before anything can be reached.

Chosen: **`<details>` / `<summary>`**, because the browser already provides the
open/closed state, keyboard operation, focus handling and the expanded
announcement. `src/js/nav.js` adds only Escape, close-on-outside-click, and
"close the others when one opens".

Known limits of this pattern, recorded rather than hidden:

- The summary is a button, not a link, so a group cannot also be a destination.
  Each group therefore offers its destinations as links inside the panel.
- `Escape` is script-only. Without JavaScript the group stays open until it is
  toggled again, which is inconvenient but not a barrier.
- Focus leaving an open group does not close it (except through Escape or an
  outside click), so the panel can sit open behind the content.

## 5. URLs

Existing URLs are preserved. New pages follow the existing pattern: a
language prefix, a section, then a slug.

```
/{lang}/themes/              all twelve themes (built)
/{lang}/themes/{id}/         one theme (built)
/{lang}/world/               international campaigns and events (built)
/{lang}/canada/              Canadian organizations and projects
/{lang}/get-involved/        organizing, toolkits, stories
```

Slugs are English in both languages, matching the rest of the site. French
pages keep the same path with `/fr/` in front.

## 6. Breadcrumbs

Use `nav.breadcrumbs` on any page deeper than the second level — theme pages,
organization profiles and event pages. The homepage, section indexes and About
do not need them. The component draws its own separator, so translators never
copy a slash.

## 7. Mobile behaviour

- Groups open **in place** under the header below 40rem, so a panel never
  covers the content the visitor is reading.
- Above 40rem they open as a positioned panel beneath the summary.
- The nav wraps onto several lines rather than hiding behind a menu button.
  With three to seven items this stays scannable and needs no script.
- If the list ever exceeds seven items or three rows at 320px, revisit this
  and introduce a single "Menu" disclosure — not a hamburger icon alone.

## 8. Adding an item

1. Create the page first. The link check fails for a URL with no page.
2. Add the item to `data/nav.yaml` with a stable `id`, bilingual `label`, and
   either a `url` or `children`.
3. Keep group children to five or fewer.
4. Run `npm test`; `scripts/validate.js` checks that every item is labelled in
   both languages, that a group has no `url` of its own, and that URLs start
   with `/`.
5. Check the row at 320px in both languages: French labels are longer and wrap
   sooner.

## 9. Decisions and open questions

**Decided in phase 3: "Monthly themes" is a child of "Take action", not a
top-level item.** With the twelve pages built, the archive is still something
you use *to act*: each theme page leads to a recipe, an alternative or a small
task. It also keeps the top level at three items, which is what the header can
carry at 320px without a menu button. If themes later grow their own events and
organizer material (phases 4 and 6), revisit this: at that point they are a
destination, not an action.

**Open: where does "Get involved" overlap with "Canada"?** Organizing is
national; the directory of organizations is Canadian. Phases 5 and 6 should
not both claim "who is doing this".
- **Does the footer need a persistent "Design system" link?** Today it is
  reachable from About only.
