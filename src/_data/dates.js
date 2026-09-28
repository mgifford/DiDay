import { upcomingFirstSundays } from "../../lib/dates.js";

// `upcoming` covers a year ahead, for the calendar file people subscribe to.
// `visible` is what the page itself lists: the next four, so the page stays
// short. Both come from the same computation, so they can't drift apart.
export default function () {
  const upcoming = upcomingFirstSundays(12);
  return { next: upcoming[0], upcoming, visible: upcoming.slice(0, 4) };
}
