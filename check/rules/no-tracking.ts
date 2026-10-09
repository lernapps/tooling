// Cookies, and data sent while a page loads (a request other than GET or HEAD, e.g. a beacon). What the app keeps
// in localStorage or IndexedDB is allowed: it is measured as `storage: device` in the fitness values.
import type { Check } from "../check.ts";

export default {
  id: "no-tracking",
  url: "https://lernapps.net/tooling/rules/#no-tracking",
  description: "No page of the built app sets a cookie or sends data while it loads.",
  severity: "error",
  run: ({ app }) =>
    app?.pages.flatMap(({ page, cookies, requests }) => [
      ...cookies.map((cookie) => ({
        where: page,
        found: `sets the cookie "${cookie}"`,
        fix: "Set no cookies; keep what the app must remember in localStorage, on the device",
      })),
      ...requests
        .filter((request) => request.method !== "GET" && request.method !== "HEAD")
        .map((request) => ({
          where: page,
          found: `sends data: ${request.method} ${request.url}`,
          fix: "Send nothing to a server; keep what the app must remember in localStorage, on the device",
        })),
    ]),
} satisfies Check;
