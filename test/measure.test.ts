// The fitness values a check measures on the visits (check/check.ts, measure): storage is device for what a page
// stored, and for what its scripts read while loading, which the app keeps after an input.
import { describe, expect, test } from "vite-plus/test";
import { measure, type PageVisit } from "../check/check.ts";

const visit = (part: Partial<PageVisit>): PageVisit =>
  ({ page: "index.html", requests: [], cookies: [], storage: [], access: [], ...part }) as PageVisit;
const BASE = "https://lernapps.net/apps/brueche/";

describe("measured storage", () => {
  test("nothing stored, nothing read: none", () => {
    expect(measure([visit({})], BASE).storage).toBe("none");
  });

  test("a key stored, or a key read while loading (an answer kept after an input): device", () => {
    expect(measure([visit({ storage: ["localStorage lernapps:brueche:stand"] })], BASE).storage).toBe("device");
    expect(
      measure(
        [visit({ access: [{ area: "sessionStorage", action: "read", name: "lernapps:brueche:antwort:/x/#a" }] })],
        BASE,
      ).storage,
    ).toBe("device");
  });
});
