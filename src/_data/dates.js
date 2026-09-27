import { upcomingFirstSundays } from "../../lib/dates.js";

export default function () {
  const upcoming = upcomingFirstSundays(12);
  return { next: upcoming[0], upcoming };
}
