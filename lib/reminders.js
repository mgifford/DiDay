// Posts around the first Sunday of the month: a teaser on the Friday
// before, the reminder itself on the first Sunday, and a check-in on the
// Monday after. Reminders are found again by the posting application's
// name and deleted once they are older than the retention period.
import { fridayBefore, mondayAfter } from "./dates.js";

export const RETENTION_DAYS = 30;

export function isFirstSunday(date) {
  return date.getUTCDay() === 0 && date.getUTCDate() <= 7;
}

const sameUtcDate = (a, b) =>
  a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();

// The first Sunday of the month `date` falls in. The Friday teaser for a
// first Sunday that falls on the 1st-3rd lands in the previous month
// (e.g. Friday 30 October teases Sunday 1 November), so both isTeaserDay
// and isFollowupDay check against neighbouring months' first Sundays
// rather than assuming same-month day numbers.
function firstSundayOfMonth(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (7 - first.getUTCDay()) % 7;
  return new Date(Date.UTC(year, month, 1 + offset));
}

export function isTeaserDay(date) {
  const thisMonth = firstSundayOfMonth(date.getUTCFullYear(), date.getUTCMonth());
  const nextMonth = firstSundayOfMonth(date.getUTCFullYear(), date.getUTCMonth() + 1);
  return sameUtcDate(date, fridayBefore(thisMonth)) || sameUtcDate(date, fridayBefore(nextMonth));
}

export function isFollowupDay(date) {
  const thisMonth = firstSundayOfMonth(date.getUTCFullYear(), date.getUTCMonth());
  const lastMonth = firstSundayOfMonth(date.getUTCFullYear(), date.getUTCMonth() - 1);
  return sameUtcDate(date, mondayAfter(thisMonth)) || sameUtcDate(date, mondayAfter(lastMonth));
}

// One occasion per calendar day, at most, checked in this order.
export function occasionFor(date) {
  if (isTeaserDay(date)) return "teaser";
  if (isFirstSunday(date)) return "reminder";
  if (isFollowupDay(date)) return "followup";
  return null;
}

const STRINGS_KEY = { teaser: "teaser_post", reminder: "reminder_post", followup: "followup_post" };

// Picks one of several variants for a given month, so the wording isn't
// identical every time, but stays the same if this ever runs twice for
// the same month (no randomness, no extra state to track).
export function pickVariant(variants, date) {
  const index = (date.getUTCFullYear() * 12 + date.getUTCMonth()) % variants.length;
  return variants[index];
}

// occasion: "teaser" | "reminder" | "followup"
export function postsForOccasion(occasion, catalog, now = new Date()) {
  const url = catalog.site.url;
  if (!url || !occasion) return [];
  const strings = catalog.strings[STRINGS_KEY[occasion]];
  return catalog.site.languages.map((lang) => ({
    language: lang,
    status: pickVariant(strings[lang], now).replaceAll("{url}", url.replace(/\/$/, "")),
  }));
}

const fromApp = (s, appName) => s.application?.name === appName;
const sameUtcDay = (a, b) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

export function postedToday(statuses, appName, now) {
  return statuses.some((s) => fromApp(s, appName) && sameUtcDay(new Date(s.created_at), now));
}

// Only this application's own posts, never pinned ones, older than the retention period.
export function expiredReminders(statuses, appName, now, days = RETENTION_DAYS) {
  const cutoff = now.getTime() - days * 86400000;
  return statuses.filter((s) => fromApp(s, appName) && !s.pinned && new Date(s.created_at).getTime() < cutoff);
}
