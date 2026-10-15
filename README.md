# tooling

The tooling with which a creator and their AI assistant build a learning app for
[lernapps.net](https://lernapps.net/): an app that runs in the browser, collects nothing, is accessible, and is
listed in the app overview within minutes. The app lives at its creator's own hosting, by default their own GitHub
Pages.

The tooling is responsible for helping builders get their apps out. The [app overview](https://github.com/lernapps/apps)
explains building and listing, and provides the apps themselves: the catalog.

The repo also holds the platform's upkeep, which creators don't use: the actions that check, publish and preview
lernapps.net's own websites, and the update policy for dependencies.

## Who it is for

- **Creators and their assistants** who build an app. The creator needs no development skills; the assistant
  follows the guidance and the checks.
- **The platform owner and the review agent**, who decide whether an app is listed.
- **Maintainers of the lernapps repos**, who change the rules, the checks and the guidance.

## Where to start

- **Creators:** [lernapps.net/apps/build/](https://lernapps.net/apps/build/) says what to tell your assistant.
- **Assistants:** read [lernapps.net/tooling/llms.txt](https://lernapps.net/tooling/llms.txt). It names the skill,
  the plan template and every link you need.
- **The skill [`lernapps-app`](skills/lernapps-app/SKILL.md):** the quick path and the rules every app follows.
  Install it with `npx skills add lernapps/tooling`.
- **The [plan template](guidance/plan-template.md):** the whole workflow of an app's first version, from the first
  question to the listing. It names each command at the step where it is needed. Every later change follows the
  [increment template](guidance/increment-template.md), in a plan of its own.
- **The [architecture](https://lernapps.net/tooling/architecture/):** what each part is responsible for and why.
- **The [rule catalog](https://lernapps.net/tooling/rules/):** every rule by id, with where it is told and checked.

## What is in it

- **The package `@lernapps/tooling`**, installed from git, not from npm: the guidance, the skills, the shared preset
  and lint rules of every app, and the CLI.
- **The CLI `lernapps`:** `create` writes a new app for an archetype once the creator confirmed the plan, `check`
  checks an app the same way in its git hooks and in CI, `update` moves an app to the runtime and tooling the latest
  tooling pins, `changes` tells what a change can affect, so that hooks and CI run only that. `npx --yes github:lernapps/tooling#main --help` before an app exists, `npx lernapps --help` in one.
- **The actions in [`actions/`](actions/):** the app check and app publish actions of every app, and the site
  actions with which lernapps.net's own websites are checked, published and previewed. Each says what it does in its
  `action.yml`. The reusable workflow [`changes.yml`](.github/workflows/changes.yml) gives other workflows the
  change scope, and its comments show how a required check never stays "Pending".
- **The [documentation site](https://lernapps.net/tooling/):** the architecture, the rule catalog, the published
  schemas and the `llms.txt`.
- **The review** in [`review/`](review/): the procedure and rubric of the agent that reviews an app before listing.
- **The Renovate preset** [`default.json`](default.json), which every lernapps repo extends.

The details live where you use them: the help of each command, the description of each action, the error messages,
and the comments in the code.

## Contributing

`npm ci`, then `npm run check` runs exactly what CI runs. The pre-push hook runs a fast subset when a push changes no code.

## Links

- [Documentation site](https://lernapps.net/tooling/), with the published schemas
- [Platform design](https://lernapps.net/docs/platform-design/)
- [App templates](https://github.com/lernapps/app-templates)
- [App overview](https://github.com/lernapps/apps)

## License

[MIT](LICENSE)
