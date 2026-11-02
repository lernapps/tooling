#!/usr/bin/env node
// A step of the app check action (actions/app-check): on a push to main, it looks for a run of this repo that has
// already checked the same tree and passed, so that the push does not check it once more. A pull request's run of the
// action, after its check passed, keeps its report as the artifact "lernapps-checked-<tree>", where <tree> is the tree
// of the commit it checked (the merge commit refs/pull/<n>/merge). After a merge that changes nothing on the way (the
// pull request was up to date with main, squashed or merged), main's commit has the same tree: the same files, the
// same package-lock.json (the tooling and the runtime) and the same workflow (the version of the action). Then the
// action takes the bundle and the report from that run instead of checking again.
//
//   node actions/app-check/checked.ts find   prints the run and writes the step output run-id (empty: none found)
//
// Only a run of this repo counts: a pull request from a fork runs its own copy of the workflow and may upload an
// artifact of any name. The token needs the permission actions: read; without it, the step says which line the job
// lacks and the action checks as before. It never fails the job: a lookup that goes wrong means a check, not a red
// run. Only Node's own modules: the action runs it before installing anything.
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const PREFIX = "lernapps app-check";
export const ARTIFACT_PREFIX = "lernapps-checked-";

/** An artifact as GET /repos/{owner}/{repo}/actions/artifacts lists it (the fields used here). */
export interface Artifact {
  name: string;
  expired: boolean;
  created_at?: string;
  workflow_run?: { id?: number; head_repository_id?: number };
}

/** The run whose artifact may stand for the check of this tree: the newest of this repo that has not expired. */
export function pick(artifacts: readonly Artifact[], tree: string, repoId: number): number | undefined {
  const name = `${ARTIFACT_PREFIX}${tree}`;
  const usable = artifacts
    .filter(
      (artifact) =>
        artifact.name === name &&
        !artifact.expired &&
        artifact.workflow_run?.head_repository_id === repoId &&
        typeof artifact.workflow_run.id === "number",
    )
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return usable[0]?.workflow_run?.id;
}

interface Env {
  api: string;
  repo: string;
  token: string;
  tree: string;
}

async function get(e: Env, path: string): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${e.api}${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${e.token}`,
      "x-github-api-version": "2022-11-28",
    },
  });
  const text = await response.text();
  try {
    return { status: response.status, body: text === "" ? undefined : JSON.parse(text) };
  } catch {
    return { status: response.status, body: undefined };
  }
}

/** The run that checked this tree, or undefined (with a notice why) when there is none or it cannot be asked. */
export async function find(e: Env): Promise<number | undefined> {
  const repo = await get(e, `/repos/${e.repo}`);
  const id = (repo.body as { id?: unknown } | undefined)?.id;
  if (repo.status !== 200 || typeof id !== "number") {
    console.log(`${PREFIX}: cannot read the repo ${e.repo} (HTTP ${repo.status}): checking`);
    return undefined;
  }
  const listed = await get(
    e,
    `/repos/${e.repo}/actions/artifacts?name=${encodeURIComponent(ARTIFACT_PREFIX + e.tree)}&per_page=100`,
  );
  if (listed.status === 403 || listed.status === 401) {
    console.log(
      `::notice::${PREFIX}: the job may not read this repo's artifacts (HTTP ${listed.status}), so it checks again what a pull request may have checked already. Add "actions: read" to the permissions of the job "app" in .github/workflows/pages.yml to skip that`,
    );
    return undefined;
  }
  const artifacts = (listed.body as { artifacts?: unknown } | undefined)?.artifacts;
  if (listed.status !== 200 || !Array.isArray(artifacts)) {
    console.log(`${PREFIX}: cannot list the artifacts (HTTP ${listed.status}): checking`);
    return undefined;
  }
  const run = pick(artifacts as Artifact[], e.tree, id);
  console.log(
    run === undefined
      ? `${PREFIX}: no run of this repo has checked the tree ${e.tree}: checking`
      : `::notice::${PREFIX}: run ${run} has checked the same tree ${e.tree} and passed: taking its bundle and report instead of checking again`,
  );
  return run;
}

async function main(argv: string[]): Promise<void> {
  if (argv[0] !== "find" || argv.length !== 1) {
    console.error("Usage: node actions/app-check/checked.ts find (GITHUB_REPOSITORY, GITHUB_TOKEN, LERNAPPS_TREE)");
    process.exit(2);
  }
  const e: Env = {
    api: (process.env["GITHUB_API_URL"] || "https://api.github.com").replace(/\/+$/, ""),
    repo: process.env["GITHUB_REPOSITORY"] ?? "",
    token: process.env["GITHUB_TOKEN"] ?? "",
    tree: process.env["LERNAPPS_TREE"] ?? "",
  };
  let run: number | undefined;
  if (e.repo === "" || e.token === "" || !/^[0-9a-f]{40,64}$/.test(e.tree)) {
    console.log(`${PREFIX}: no repo, token or tree to look up: checking`);
  } else {
    try {
      run = await find(e);
    } catch (error) {
      console.log(`${PREFIX}: the lookup failed (${error instanceof Error ? error.message : String(error)}): checking`);
    }
  }
  const file = process.env["GITHUB_OUTPUT"];
  if (file) appendFileSync(file, `run-id=${run ?? ""}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main(process.argv.slice(2));
