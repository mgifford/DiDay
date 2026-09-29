// First Sundays are computed at build time, so the site must be rebuilt
// at least weekly (see the scheduled workflow).
function firstSunday(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (7 - first.getUTCDay()) % 7;
  return new Date(Date.UTC(year, month, 1 + offset));
}

export function upcomingFirstSundays(count = 12, from = new Date()) {
  const today = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const out = [];
  let year = from.getUTCFullYear();
  let month = from.getUTCMonth();
  while (out.length < count) {
    const d = firstSunday(year, month);
    if (d.getTime() >= today) out.push(d);
    month += 1;
    if (month > 11) { month = 0; year += 1; }
  }
  return out;
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

// The Friday immediately before a first Sunday.
export function fridayBefore(firstSundayDate) {
  return addDays(firstSundayDate, -2);
}

// The Monday immediately after a first Sunday.
export function mondayAfter(firstSundayDate) {
  return addDays(firstSundayDate, 1);
}
