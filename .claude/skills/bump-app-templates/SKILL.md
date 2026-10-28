---
name: bump-app-templates
description: "Pin the generator and its tests at the current main of lernapps/app-templates (appTemplates.commit in package.json). Use when a change of app-templates has merged, or when a pull request here needs its pin brought up to date."
---

Run in the repo root:

```bash
sha=$(git ls-remote https://github.com/lernapps/app-templates.git refs/heads/main | cut -f1)
npm pkg set appTemplates.commit="$sha"
npx vp check && npx vp test run
```

Commit with the skill `commit`, as `chore(deps): pin app-templates <first 7 characters of sha>, <what the commits since the old pin change>`. Only `package.json` changes.
