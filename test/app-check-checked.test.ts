// A push to main takes the check of a pull request with the same tree (actions/app-check/checked.ts), and the shared
// Playwright configuration retries a failed test on CI only (lernapps/app-templates#125).
//   - pick: only an artifact of this tree, not expired, from a run of this repo (not a fork) counts; the newest wins;
//   - find: asks the repo's id and its artifacts; without the permission actions: read it checks (no run) with a notice;
//   - the action: the steps up to the check are skipped when a run was taken; a pull request keeps its report under
//     the name of its tree; the app's workflow grants actions: read to the job app;
//   - archetypes/shared/playwright.ts: retries 2 with CI set, 0 without.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { parse } from "yaml";
import { ARTIFACT_PREFIX, find, pick, type Artifact } from "../actions/app-check/checked.ts";

const repoRoot = join(import.meta.dirname, "..");
const TREE = "a".repeat(40);
const REPO_ID = 42;
const artifact = (over: Partial<Artifact> & { run?: number; repo?: number } = {}): Artifact => ({
  name: `${ARTIFACT_PREFIX}${TREE}`,
  expired: false,
  created_at: "2026-11-02T10:00:00Z",
  workflow_run: { id: over.run ?? 1, head_repository_id: over.repo ?? REPO_ID },
  ...over,
});

describe("pick", () => {
  test("takes the newest run of this repo that checked this tree", () => {
    expect(
      pick(
        [artifact({ run: 1 }), artifact({ run: 2, created_at: "2026-11-02T11:00:00Z" }), artifact({ run: 3 })],
        TREE,
        REPO_ID,
      ),
    ).toBe(2);
  });
  test("ignores a fork's run, an expired artifact and another tree", () => {
    expect(
      pick(
        [
          artifact({ run: 1, repo: 7 }),
          artifact({ run: 2, expired: true }),
          artifact({ run: 3, name: `${ARTIFACT_PREFIX}${"b".repeat(40)}` }),
        ],
        TREE,
        REPO_ID,
      ),
    ).toBeUndefined();
  });
});

describe("find", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  const e = { api: "https://api.example", repo: "o/app", token: "t", tree: TREE };
  const answer = (routes: Record<string, [number, unknown]>) =>
    vi.fn(async (url: string) => {
      const path = url.slice(e.api.length).split("?")[0] ?? "";
      const [status, body] = routes[path] ?? [404, { message: "Not Found" }];
      return new Response(JSON.stringify(body), { status });
    });

  test("returns the run that checked the tree, asking for the artifact by its name", async () => {
    const fetch = answer({
      "/repos/o/app": [200, { id: REPO_ID }],
      "/repos/o/app/actions/artifacts": [200, { artifacts: [artifact({ run: 9 })] }],
    });
    vi.stubGlobal("fetch", fetch);
    vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await find(e)).toBe(9);
    expect(fetch.mock.calls.map(([url]) => url)).toContain(
      `${e.api}/repos/o/app/actions/artifacts?name=${ARTIFACT_PREFIX}${TREE}&per_page=100`,
    );
  });

  test("without the permission actions: read it checks, and the notice names the line to add", async () => {
    vi.stubGlobal(
      "fetch",
      answer({
        "/repos/o/app": [200, { id: REPO_ID }],
        "/repos/o/app/actions/artifacts": [403, { message: "Resource not accessible by integration" }],
      }),
    );
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await find(e)).toBeUndefined();
    expect(log.mock.calls.flat().join("\n")).toContain('Add "actions: read"');
  });
});

interface Step {
  id?: string;
  if?: string;
  uses?: string;
  with?: Record<string, string>;
}
const action = parse(readFileSync(join(repoRoot, "actions/app-check/action.yml"), "utf8")) as {
  runs: { steps: Step[] };
};

describe("the app check action", () => {
  const steps = action.runs.steps;
  const at = (id: string) => steps.findIndex((step) => step.id === id);

  test("looks up a run on a push to main only, and skips every step up to the check when it took one", () => {
    expect(steps[at("checked")]?.if).toContain("github.event_name == 'push' && github.ref == 'refs/heads/main'");
    for (const step of steps.slice(at("checked") + 1, at("check") + 1)) {
      const taken = step.uses?.startsWith("actions/download-artifact") === true;
      expect(step.if, JSON.stringify(step)).toContain(
        taken ? "steps.checked.outputs.run-id != ''" : "steps.checked.outputs.run-id == ''",
      );
    }
  });

  test("a pull request whose check passed keeps its report under the name of the tree it checked", () => {
    const kept = steps.find(
      (step) =>
        step.uses?.startsWith("actions/upload-artifact@") === true &&
        step.with?.["name"] === "lernapps-checked-${{ steps.tree.outputs.tree }}",
    );
    expect(kept?.if).toContain("github.event_name == 'pull_request' && steps.check.outcome == 'success'");
    expect(kept?.if).toContain("inputs.upload == 'true'");
  });

  test("the app's workflow lets the job app read the artifacts", () => {
    const pages = parse(readFileSync(join(repoRoot, "generator/app/.github/workflows/pages.yml"), "utf8")) as {
      jobs: Record<string, { permissions?: Record<string, string> }>;
    };
    expect(pages.jobs["app"]?.permissions).toEqual({ contents: "read", actions: "read" });
  });
});

describe("the shared Playwright configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });
  const retries = async () =>
    ((await import("../archetypes/shared/playwright.ts")).default as { retries?: number }).retries;

  test("retries a failed test twice on CI", async () => {
    vi.stubEnv("CI", "true");
    expect(await retries()).toBe(2);
  });
  test("does not retry locally", async () => {
    vi.stubEnv("CI", "");
    expect(await retries()).toBe(0);
  });
});
