#!/usr/bin/env bash
# Builds the tooling's documentation into _site/ for https://lernapps.net/tooling/: the start page (the phases of its
# workshop card from workshop.yaml), the page Which assistant to build with (assistants/, with three apps an eval built
# in examples/, as their build wrote them), the page A workshop, not a factory (workshop/: who does what
# in which phase, rendered by scripts/workshop.ts from the building blocks), the page GitHub, explained (github/), the page Prompt
# engineering with the eval runs (prompt-engineering/, rendered by evals/site.ts from evals/runs/; evals/ redirects
# to it) and its page How we evaluate the guidance (prompt-engineering/how-evals-work/), llms.txt, the rule page (rules/, read from the artifacts by scripts/rules.ts), the JSON Schemas of the
# validation report and of the review verdict (schemas/) and the architecture (arc42, docs/arc42/) as the arc42 web
# app. The schemas of a quiz's question bank and of an explainer's content are not published: they live with their
# runtimes in lernapps/app-templates, in the app's node_modules, where its YAML and JSON files point to them.
# A pull request preview (pr-preview.yml) sets SITE_PATH_PREFIX=/tooling/pr-preview/pr-<number>/ and
# SITE_PREVIEW=1. The tools (arc42, the shared site frame) are pinned in package.json: run `npm ci` first.
#
#   npm run build && npm run check:site         the site, built and checked (the job `site` in pages.yml)
#   ARC42_DIFF_BASE=origin/main npm run build   also the review page of the architecture's changes
#   npm run arc42 -- <command>                  any arc42 command on docs/arc42/ (validate, get, diff, ...)
#   python3 -m http.server -d _site 8000        a local look; links assume the /tooling/ prefix
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$PWD/node_modules/.bin:$PATH"
PREFIX="${SITE_PATH_PREFIX:-/tooling/}"

rm -rf _site
mkdir -p _site
cp site/index.html site/spa.css site/llms.txt _site/
mkdir -p _site/github/updates _site/assistants
cp site/github/index.html _site/github/
cp site/github/updates/index.html _site/github/updates/
cp site/assistants/index.html _site/assistants/
mkdir -p _site/prompt-engineering/how-evals-work _site/evals
node evals/site.ts page _site/prompt-engineering
cp site/prompt-engineering/how-evals-work/index.html _site/prompt-engineering/how-evals-work/
cp site/evals/index.html _site/evals/
mkdir -p _site/schemas
cp check/validation-report.v1.schema.json review/verdict.v1.schema.json _site/schemas/
node scripts/rules.ts page _site/rules/index.html
node scripts/workshop.ts page _site/workshop/index.html
node scripts/workshop.ts home _site/index.html

arc42 --dir docs/arc42 validate
arc42 --dir docs/arc42 build --out _site/architecture --base "${PREFIX}architecture/"

# Review builds: with ARC42_DIFF_BASE set (e.g. origin/main in a pull request), also render the
# architecture's changes since the merge base with that ref as one self-contained page, and write the
# change as JSON (changes.json) for the PR comment. Compares commits (<base>...HEAD), not the working tree.
# Findings of `arc42 diff` (block and prose not changed together) are reported, not fatal.
if [ -n "${ARC42_DIFF_BASE:-}" ]; then
  range="$ARC42_DIFF_BASE...HEAD"
  arc42 --dir docs/arc42 build --single-file --diff "$range" --out _site/architecture-diff
  arc42 --dir docs/arc42 diff "$range" --format json > _site/architecture-diff/changes.json || [ -s _site/architecture-diff/changes.json ]
fi

# The arc42 app comes with the shared header above it: keep its fixed controls off the header (site/spa.css).
# Before the frame: it copies the pages into /tooling/en/, which then get it too.
node scripts/html-edit.ts head-link ../spa.css _site/architecture/index.html _site/architecture-diff/index.html
lernapps-frame --site /tooling/ --source https://github.com/lernapps/tooling --out _site
# The usage counter of the platform sites (/lernapps-count.js, served by lernapps.github.io, see "Usage counter" in
# its README): this site's pages count their visits, never in a preview. Not part of the site frame: apps use the
# frame too, and apps are never counted.
if [ -z "${SITE_PREVIEW:-}" ]; then
  node scripts/html-edit.ts head-script /lernapps-count.js _site
fi

# The example apps come last: they are apps, built with their own frame, so they get neither this site's frame nor
# its usage counter. They link the privacy notice and the imprint at lernapps.net's full address; the check wants
# the path.
cp -r site/examples _site/
node scripts/html-edit.ts local-legal-links _site/examples

touch _site/.nojekyll
echo "built _site/"
