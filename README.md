# tooling

The tooling with which a creator and their AI assistant build a learning app for
[lernapps.net](https://lernapps.net/): an app that runs in the browser, collects nothing, is accessible, and is
listed in the app overview within minutes. The app lives at its creator's own hosting, by default their own GitHub
Pages. The repo also holds the platform's upkeep, which creators don't use: the actions that check, publish and
preview lernapps.net's own websites, and the update policy for dependencies.

## Who it is for

- **Creators and their assistants** who build an app. The creator needs no development skills; the assistant
  follows the guidance and the checks.
- **The platform owner and the review agent**, who decide whether an app is listed.
- **Maintainers of the lernapps repos**, who change the rules, the checks and the guidance.

## Where to start

- **Assistants:** read [lernapps.net/tooling/llms.txt](https://lernapps.net/tooling/llms.txt). It names the skill,
  the plan template and every link you need.
- **The skill [`lernapps-app`](skills/lernapps-app/SKILL.md):** the rules every app follows. Install it with
  `npx skills add lernapps/tooling`.
- **The [plan template](guidance/plan-template.md):** the whole workflow, from the first question to the listing. It
  names each command at the step where it is needed.
- **The [architecture](https://lernapps.net/tooling/architecture/):** what each part is responsible for and why.
- **The [rule catalog](https://lernapps.net/tooling/rules/):** every rule by id, with where it is told and checked.

The details live where you use them: `npx lernapps --help` and the help of each command, the description of each
action in [`actions/`](actions/), the error messages, and the comments in the code.

## Contributing

`npm ci`, then `npm run check` runs exactly what CI runs; the git hooks run it too.

## Links

- [Documentation site](https://lernapps.net/tooling/), with the published schemas
- [Platform design](https://lernapps.net/docs/platform-design/)
- [App templates](https://github.com/lernapps/app-templates)
- [App overview](https://github.com/lernapps/apps)

## License

[MIT](LICENSE)
