// Review dates. Each alternative, cancel entry and recipe can carry
// last_reviewed: YYYY-MM-DD, set by the person who checked it.

// js-yaml reads an unquoted date as a Date; accept a string too.
export function toDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// Add months in UTC, keeping the day inside the target month (31 Jan + 1 = 28 or 29 Feb).
export function addMonths(date, months) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(date.getUTCDate(), last)));
}

// never | current | due-soon | overdue
export function reviewStatus(item, maxMonths, dueSoonDays, today = new Date()) {
  const reviewed = toDate(item.last_reviewed);
  if (!reviewed) return { state: "never", due: null };
  const due = addMonths(reviewed, maxMonths);
  const warnFrom = new Date(due.getTime() - dueSoonDays * 86400000);
  const state = today >= due ? "overdue" : today >= warnFrom ? "due-soon" : "current";
  return { state, due, reviewed };
}

export function allReviews(catalog, today = new Date()) {
  const { max_age_months: limits, due_soon_days: soon } = catalog.review;
  const out = [];
  for (const kind of ["alternatives", "cancel", "recipes"]) {
    for (const item of catalog[kind]) {
      out.push({ kind, item, key: `${kind}.${item.id}`, ...reviewStatus(item, limits[kind], soon, today) });
    }
  }
  return out;
}
