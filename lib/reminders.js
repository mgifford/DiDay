// Monthly reminder posts: one in English, one in French, on each first Sunday.
// Reminders are found again by the posting application's name and deleted
// once they are older than the retention period.

export const RETENTION_DAYS = 30;

export function isFirstSunday(date) {
  return date.getUTCDay() === 0 && date.getUTCDate() <= 7;
}

export function reminderPosts(catalog) {
  const url = catalog.site.url;
  if (!url) return [];
  return catalog.site.languages.map((lang) => ({
    language: lang,
    status: catalog.strings.reminder_post[lang].replaceAll("{url}", url.replace(/\/$/, "")),
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
