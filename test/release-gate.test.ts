// The release gate of @lernapps/tooling: release.yml publishes only after an app has been started from the package as
// it would be published (test/init.e2e.test.ts, with and without CI). A version that cannot start an app, for example
// because a dependency changed its behaviour in CI, must never reach npm.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { HEAVY_TESTS } from "../scripts/pre-push.ts";
import { repoRoot } from "./support.ts";

type Step = { run?: string; uses?: string };
const release = parse(readFileSync(join(repoRoot, ".github/workflows/release.yml"), "utf8")) as {
  jobs: Record<string, { steps: Step[] }>;
};
const steps = Object.values(release.jobs).flatMap((job) => job.steps);
const index = (match: (step: Step) => boolean) => steps.findIndex(match);

describe("the release of the tooling", () => {
  test("starts an app from the packed package, with and without CI, before semantic-release publishes", () => {
    const gate = index((step) => step.run?.includes("test/init.e2e.test.ts") === true);
    const publish = index((step) => step.run?.includes("semantic-release") === true);
    expect(gate, "release.yml runs test/init.e2e.test.ts").toBeGreaterThanOrEqual(0);
    expect(publish).toBeGreaterThan(gate);
    expect(readFileSync(join(repoRoot, "test/init.e2e.test.ts"), "utf8")).toMatch(/CI: "true"/);
  });

  test("the gate is a heavy test: a push that changes the code or the dependencies runs it before it leaves", () => {
    expect(HEAVY_TESTS).toContain("test/init.e2e.test.ts");
  });
});
