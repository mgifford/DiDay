// Calendar file with the next 12 first Sundays as all-day events.
export const data = { permalink: "/calendar.ics", eleventyExcludeFromCollections: true };

export function render({ dates, catalog }) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");
  const next = (d) => ymd(new Date(d.getTime() + 86400000));
  // The site name is the same in both languages, so a plain join repeated it.
  const name = [...new Set([catalog.site.name.en, catalog.site.name.fr])].join(" / ");
  // The UID has to be globally unique, so use the site's own hostname rather
  // than a reserved .invalid name that no client can resolve.
  const uidHost = new URL(catalog.site.url).hostname;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${name}//Calendar//EN`,
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${name}`,
    ...dates.upcoming.flatMap((d) => [
      "BEGIN:VEVENT",
      `UID:first-sunday-${ymd(d)}@${uidHost}`,
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
