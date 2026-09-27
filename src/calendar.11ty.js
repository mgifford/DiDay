// Calendar file with the next 12 first Sundays as all-day events.
export const data = { permalink: "/calendar.ics", eleventyExcludeFromCollections: true };

export function render({ dates, catalog }) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");
  const next = (d) => ymd(new Date(d.getTime() + 86400000));
  const name = `${catalog.site.name.en} / ${catalog.site.name.fr}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//First Sunday Canada//EN",
    "CALSCALE:GREGORIAN",
    ...dates.upcoming.flatMap((d) => [
      "BEGIN:VEVENT",
      `UID:first-sunday-${ymd(d)}@first-sunday.invalid`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(d)}`,
      `DTEND;VALUE=DATE:${next(d)}`,
      `SUMMARY:${name}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
