#!/usr/bin/env bash
# Builds the tooling's documentation into _site/ for https://lernapps.net/tooling/: the start page (the phases of its
# workshop card from workshop.yaml), the page A workshop, not a factory (workshop/: who does what in which phase,
# rendered by scripts/workshop.ts from the
# building blocks), the page GitHub, explained (github/), the eval results (evals/, written by evals/report.ts),
# llms.txt, the rule page (rules/,
# read from the artifacts by scripts/rules.ts), the JSON Schemas of the validation report, of the review verdict, of
# the question bank of a quiz and of the content of an explainer (schemas/; the last two from lernapps/app-templates
# at the pinned commit) and the architecture (arc42, docs/arc42/) as the arc42 web app.
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
cp site/index.html site/stil.css site/spa.css site/llms.txt _site/
mkdir -p _site/github
cp site/github/index.html _site/github/
mkdir -p _site/prompt-engineering _site/evals
cp site/prompt-engineering/index.html site/prompt-engineering/data.json _site/prompt-engineering/
cp site/evals/index.html _site/evals/
mkdir -p _site/schemas
cp check/validation-report.v1.schema.json review/verdict.v1.schema.json _site/schemas/
# The schemas of a quiz's question bank and of an explainer's content live with their runtimes in
# lernapps/app-templates: published from the commit pinned in package.json, read from the local clone named by
# LERNAPPS_TEMPLATES or fetched with git. The explainer's refers to the quiz's for its question exercises.
templates_commit=$(node -p 'require("./package.json").appTemplates.commit')
templates_repo="${LERNAPPS_TEMPLATES:-$(node -p 'require("./package.json").appTemplates.repository')}"
templates_work=$(mktemp -d)
trap 'rm -rf "$templates_work"' EXIT
git init --quiet "$templates_work"
git -C "$templates_work" fetch --quiet --depth 1 "$templates_repo" "$templates_commit"
for schema in quiz/quiz.v1.schema.json explainer/explainer.v1.schema.json; do
  git -C "$templates_work" show "FETCH_HEAD:runtime/$schema" > "_site/schemas/$(basename "$schema")"
done
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

lernapps-frame --site /tooling/ --source https://github.com/lernapps/tooling --out _site
# The usage counter of the platform sites (/lernapps-count.js, served by lernapps.github.io, see "Usage counter" in
# its README): this site's pages count their visits, never in a preview. Not part of the site frame: apps use the
# frame too, and apps are never counted.
if [ -z "${SITE_PREVIEW:-}" ]; then
  find _site -name '*.html' -exec sed -i '0,/<\/head>/s||<script src="/lernapps-count.js" defer></script>\n</head>|' {} +
fi
# The arc42 app comes with the shared header above it: keep its fixed controls off the header (site/spa.css).
for app in _site/architecture/index.html _site/architecture-diff/index.html; do
  [ -f "$app" ] && sed -i 's|</head>|<link rel="stylesheet" href="../spa.css">\n</head>|' "$app"
done

touch _site/.nojekyll
echo "built _site/"
