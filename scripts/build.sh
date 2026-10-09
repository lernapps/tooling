#!/usr/bin/env bash
# Builds the tooling's documentation into _site/ for https://lernapps.net/tooling/: a short start page, the
# rule page (rules/, read from the artifacts by scripts/rules.ts), the JSON Schemas of the validation report and
# of the review verdict (schemas/) and the architecture (arc42, docs/arc42/) as the arc42 web app.
# A pull request preview (pr-preview.yml) sets SITE_PATH_PREFIX=/tooling/pr-preview/pr-<number>/ and
# SITE_PREVIEW=1. The tools (arc42, the shared site frame) are pinned in package.json: run `npm ci` first.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$PWD/node_modules/.bin:$PATH"
PREFIX="${SITE_PATH_PREFIX:-/tooling/}"

rm -rf _site
mkdir -p _site
cp site/index.html site/stil.css site/spa.css _site/
mkdir -p _site/schemas
cp check/validation-report.v1.schema.json review/verdict.v1.schema.json _site/schemas/
node scripts/rules.ts page _site/rules/index.html

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
# The arc42 app comes with the shared header above it: keep its fixed controls off the header (site/spa.css).
for app in _site/architecture/index.html _site/architecture-diff/index.html; do
  [ -f "$app" ] && sed -i 's|</head>|<link rel="stylesheet" href="../spa.css">\n</head>|' "$app"
done

touch _site/.nojekyll
echo "built _site/"
