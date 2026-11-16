// The dev container image (devcontainer/Dockerfile) pins every version it installs, and Renovate moves them: the
// built-in preset customManagers:dockerfileVersions finds each `# renovate: datasource=… depName=…` comment above an
// `ARG …_VERSION=…`. The pattern below is that preset's, run here as Renovate runs it (a RegExp with the flag "g"), so
// that a Dockerfile Renovate would skip fails here. The browser of the image is the Playwright of package.json, the one
// `lernapps check` expects; and the image is built when its files change, not on a schedule.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { repoRoot } from "./support.ts";

const RENOVATE_DOCKERFILE_VERSIONS =
  "# renovate: datasource=(?<datasource>[a-zA-Z0-9-._]+?) depName=(?<depName>[^\\s]+?)(?: (lookupName|packageName)=(?<packageName>[^\\s]+?))?(?: versioning=(?<versioning>[^\\s]+?))?(?: extractVersion=(?<extractVersion>[^\\s]+?))?(?: registryUrl=(?<registryUrl>[^\\s]+?))?\\s(?:ENV|ARG)\\s+[A-Za-z0-9_]+?_VERSION[ =][\"']?(?<currentValue>.+?)[\"']?\\s";

const dockerfile = readFileSync(join(repoRoot, "devcontainer/Dockerfile"), "utf8");
const pinned = [...dockerfile.matchAll(new RegExp(RENOVATE_DOCKERFILE_VERSIONS, "g"))].map((match) => ({
  datasource: match.groups?.["datasource"],
  depName: match.groups?.["depName"],
  version: match.groups?.["currentValue"],
}));

test("every tool the image installs has a pinned version that Renovate finds", () => {
  expect(pinned.map((pin) => pin.depName).sort()).toEqual(["@playwright/cli", "playwright"]);
  for (const pin of pinned) {
    expect(pin.datasource, pin.depName).toBe("npm");
    expect(pin.version, pin.depName).toMatch(/^\d+\.\d+\.\d+$/);
  }
});

test("the install commands use the pinned versions, not the newest", () => {
  expect(dockerfile).not.toMatch(/claude-code|@openai\/codex/); // the editor extensions bring their own command line
  expect(dockerfile).toContain("@playwright/cli@${PLAYWRIGHT_CLI_VERSION}");
  expect(dockerfile).toContain("playwright@${PLAYWRIGHT_VERSION} install");
  expect(dockerfile).not.toMatch(/@latest/);
});

test("the browser of the image is the Playwright of package.json", () => {
  const manifest = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
    devDependencies?: Record<string, string>;
    dependencies?: Record<string, string>;
  };
  const wanted = manifest.dependencies?.["playwright"] ?? manifest.devDependencies?.["playwright"];
  expect(pinned.find((pin) => pin.depName === "playwright")?.version).toBe(wanted);
});

test("Renovate moves the image's Playwright together with package.json's", () => {
  const config = JSON.parse(readFileSync(join(repoRoot, "renovate.json"), "utf8")) as {
    extends: string[];
    packageRules: { matchDepNames?: string[]; groupName?: string }[];
  };
  expect(config.extends).toContain("customManagers:dockerfileVersions");
  expect(config.packageRules.find((rule) => rule.matchDepNames?.includes("playwright"))?.groupName).toBe("playwright");
});

test("the image is built when its files change, not on a schedule", () => {
  const workflow = parse(readFileSync(join(repoRoot, ".github/workflows/devcontainer-image.yml"), "utf8")) as {
    on: Record<string, unknown>;
  };
  expect(Object.keys(workflow.on).sort()).toEqual(["push", "workflow_dispatch"]);
});

test("the agents of the workplace are in view when the codespace opens", () => {
  // The Claude Code extension hides its icon in the activity bar when the editor has a secondary side bar, and Codex
  // sits there too: with that bar closed, a creator sees neither agent.
  const container = JSON.parse(
    readFileSync(join(repoRoot, "generator/app/.devcontainer/devcontainer.json"), "utf8"),
  ) as {
    customizations: { vscode: { extensions: string[]; settings: Record<string, unknown> } };
  };
  const { extensions, settings } = container.customizations.vscode;
  expect(extensions).toEqual(["anthropic.claude-code", "openai.chatgpt"]);
  expect(settings["workbench.secondarySideBar.defaultVisibility"]).toBe("visible");
});
