# Deployment View

The tooling has no server of its own. Its parts are files in git repos on GitHub, and they reach the places where
they run as git commits. Update pull requests move those commits forward. This chapter says, per node, what it
receives and what it hosts; what each part does is in chapter 5. lernapps.net hosts nothing of an app: the app lives
at its developer's hosting, by default the developer's own GitHub Pages, and the catalog links to it (decision
`dec-app-own-hosting`).

## Deployment overview

The arrows show where the parts go: from the repos on GitHub to the creator's machine, to the CI of the repos and to
the environment for lernapps agents. The developer's GitHub Actions check the app and publish it to GitHub Pages or leave it for any other hosting. A listing goes
from the catalog's CI to the review.

```arc42
:::diagram
id: deployment-overview
view: deployment
notation: mermaid-architecture
aliases: creator=dn-creator-machine, agents=dn-lernapps-agents, toolingrepo=dn-tooling-repo, templaterepo=dn-templates-repo, appci=dn-app-ci, appsci=dn-apps-ci, generator=bb-generator, hooks=bb-git-hooks, checklocal=bb-check-cli, skills=bb-skills, guidance=bb-process-guidance, package=bb-tooling-package, templates=bb-app-templates, appcheck=bb-app-check-action, publish=bb-app-publish, listing=bb-listing-validation, review=bb-review-procedure, evals=bb-evals
:::
```

```mermaid
architecture-beta
    group creator(server)[Creator machine]
    group toolingrepo(disk)[GitHub lernapps tooling]
    group templaterepo(disk)[GitHub lernapps app templates]
    group appci(server)[Developer GitHub Actions]
    group appsci(server)[GitHub lernapps apps CI]
    group agents(server)[lernapps agents]
    service guidance(server)[Agent instructions] in creator
    service skills(server)[Skills in the harness] in creator
    service generator(server)[Generator] in creator
    service checklocal(server)[Check] in creator
    service hooks(server)[Hooks] in creator
    service package(disk)[Package actions skills] in toolingrepo
    service templates(disk)[Templates and runtime] in templaterepo
    service appcheck(server)[App check] in appci
    service publish(internet)[App publish to GitHub Pages] in appci
    service listing(server)[Listing] in appsci
    service review(server)[Review] in agents
    service evals(server)[Evals] in agents
    package:L --> R:generator
    templates:T --> B:generator
    generator:L --> R:guidance
    generator:B --> T:checklocal
    checklocal:L --> R:hooks
    package:T --> B:skills
    package:B --> T:appcheck
    appcheck:R --> L:publish
    package:R --> L:listing
    listing:T --> B:review
    review:R --> L:evals
```

## Creator's machine

The creator's computer or their assistant's sandbox. Nothing of the tooling is installed there at first, and
nothing globally. It receives, in this order: the generator (block "Generator"), the archetype's template, then the
package and the runtime as the app's dependencies, with the git hooks. The first check that needs a browser uses one
the sandbox provides, or else fetches one and keeps it.

From then on, the check, the lint rules and the hooks run from the app's own dependencies. The machine needs git, Node
and network access to GitHub and the npm registry. If a sandbox blocks them, the creator allows them; the assistant
does not write the app by hand.

```arc42
:::deployment-node
id: dn-creator-machine
title: Creator's machine or assistant sandbox
type: device
hosts: bb-tooling-package, bb-generator, bb-archetypes, bb-git-hooks, bb-lint-rules, bb-check-cli, bb-app-templates
:::
```

### Creator's agent harness

The runtime of the creator's assistant, whichever it is. It receives the agent instructions, which the generator
writes into the app, and the skills, copied from GitHub into the harness and refreshed the same way: those of every
phase at the start, those of the archetype when Explore chooses it. Before the app
exists, the assistant starts the plan from the published template. The harness decides when to load a skill; its own
hooks may add convenience but enforce nothing.

```arc42
:::deployment-node
id: dn-agent-harness
title: Creator's agent harness, with AGENTS.md and the skill folder
type: environment
parent: dn-creator-machine
hosts: bb-process-guidance, bb-skills, bb-skills-process, bb-skills-tooling, bb-skills-content, bb-skills-archetypes
:::
```

## Environment for lernapps agents

Where agents defined by lernapps run: the review agent on a listing, and the evals. Today it is the owner's machine,
or for the review a job of lernapps/apps that the owner starts on the listing pull request.
The evals run in a cloud container with Docker, where Harbor starts one container per trial (`dec-eval-runs-with-harbor`).
It receives a checkout of the tooling at its main line. For a review, it receives the app at the commit to review.
Only the verdict leaves this environment: the owner, or that job, posts it on the listing.

```arc42
:::deployment-node
id: dn-lernapps-agents
title: Environment for lernapps agents
type: environment
hosts: bb-tooling-package, bb-generator, bb-review-procedure, bb-evals, bb-check-cli
:::
```

## GitHub

The means of production (`con-github`): every part of the tooling comes from a repo here. Its Pages serve
lernapps.net's own websites and, by default, the apps, each at its developer's address.

```arc42
:::deployment-node
id: dn-github
title: GitHub
type: cloud-region
:::
```

### lernapps/tooling

The source of the package, the actions and the skills. Every consumer takes them at a commit: the package as a
dependency, the actions by name in a workflow, the skills by copying them. It also hosts Platform upkeep: the
tooling's own build publishes its documentation, rule catalog and schemas on lernapps.net with the platform site
actions, and the Renovate preset is read from here by every lernapps repo.

```arc42
:::deployment-node
id: dn-tooling-repo
title: lernapps/tooling repository
type: environment
parent: dn-github
hosts: bb-tooling-package, bb-app-check-action, bb-app-publish, bb-app-preview, bb-tooling-build, bb-site-check, bb-site-deploy, bb-site-preview, bb-renovate-preset
:::
```

### lernapps/app-templates

Hosts the templates, which the generator fetches at the commit the package pins, and the runtime, which every app
installs at the commit of its template.

```arc42
:::deployment-node
id: dn-templates-repo
title: lernapps/app-templates repository
type: environment
parent: dn-github
hosts: bb-app-templates
:::
```

### Developer's GitHub Actions

The GitHub Actions of the app repo, which belongs to the developer: the node where the app check, the app publish and
the app preview action run. It receives them,
named in the workflow the generator wrote, at the commit of the package the app was created with. On every change it
runs the same check as the hooks. On the main line it publishes the checked bundle to the GitHub Pages of the app's
repo; on a pull request from the repo itself it previews it there.

```arc42
:::deployment-node
id: dn-app-ci
title: Developer's GitHub Actions
type: container
parent: dn-github
hosts: bb-app-check-action, bb-app-publish, bb-app-preview, bb-check-cli
:::
```

### lernapps/apps CI

The CI of the catalog. It receives the package at a commit and runs the listing validation on every pull request that
adds or changes an entry. When the owner merges a listing, the catalog publishes it, and the entry links to the app.

```arc42
:::deployment-node
id: dn-apps-ci
title: lernapps/apps CI (GitHub Actions)
type: container
parent: dn-github
hosts: bb-listing-validation, bb-check-cli
:::
```

### The app's hosting

Where the app is served: the developer's choice. lernapps.net hosts nothing of an app; the catalog entry links to its
address. Nothing of the tooling runs here.

```arc42
:::deployment-node
id: dn-app-hosting
title: The app's hosting (the developer's choice)
type: environment
:::
```

#### GitHub Pages

The default. The GitHub Pages of the app's repo receive the checked bundle from the app publish action and serve it
at the developer's address, and a pull request's preview from the app preview action below it, usually their own github.io address. Only an app repo of the lernapps organisation is
served below lernapps.net. The same service serves lernapps.net's own websites.

```arc42
:::deployment-node
id: dn-github-pages
title: GitHub Pages (default)
type: environment
parent: dn-app-hosting
:::
```

#### Any other hosting

Any static host the developer chooses. The developer publishes the bundle there and points the catalog entry at its
address; the checks work on that address the same way.

```arc42
:::deployment-node
id: dn-other-hosting
title: Any other hosting
type: environment
parent: dn-app-hosting
:::
```

## How updates arrive

Every app repo receives the organisation's update policy (block "Renovate preset") from the generator. An update pull request arrives when the
package, the runtime or the actions have a newer commit. The app check action runs on it, and the policy decides when
it merges. The creator's assistant can also move the app to the pins of the newest tooling at once, with the
generator. The template an app was created from does not change afterwards; new features reach the app through the
runtime. The skills in the harness change when they are copied again.
