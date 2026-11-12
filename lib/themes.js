// Which monthly theme the homepage shows.
//
// `themeForDate` expects the date of the next first Sunday, as produced by
// upcomingFirstSundays() in lib/dates.js. Callers do not pass "today".
//
// The theme belongs to the month of the *next* first Sunday, not to the
// calendar month. On 2 December the next first Sunday is 6 December, so
// December's theme is current. On 7 December the next one is 3 January, so
// January's theme takes over. That keeps the homepage, the hero date and the
// reminder posts telling the same story.
//
// Themes repeat every year and the data file holds one entry per month.

// 1 = January. Dates in this project are UTC midnight; read them in UTC so a
// build on a machine in another timezone cannot shift the month.
export function monthOf(date) {
  return date.getUTCMonth() + 1;
}

export function themeForMonth(themes, month) {
  return themes.find((theme) => theme.month === month) ?? null;
}

export function themeForDate(themes, date) {
  return themeForMonth(themes, monthOf(date));
}

// Months with no theme yet. Phase 3 fills them; until then the homepage hides
// the section rather than showing an invented theme, and the build warns.
export function monthsWithoutTheme(themes) {
  const defined = new Set(themes.map((theme) => theme.month));
  return Array.from({ length: 12 }, (_, index) => index + 1).filter((month) => !defined.has(month));
}

// Themes in calendar order, for the index page.
export function byMonth(themes) {
  return [...themes].sort((a, b) => a.month - b.month);
}

// The theme of the month after this one. Used for the "next month" link, so a
// reader can see that the calendar keeps going.
export function themeAfter(themes, theme) {
  if (!theme) return null;
  return themeForMonth(themes, theme.month === 12 ? 1 : theme.month + 1);
}
