# Architecture Constraints

The constraints come from the platform design, the organisation's rules across repos
([ORGANIZATION.md](https://github.com/lernapps/.github/blob/main/ORGANIZATION.md)) and the owner's decisions. They
apply to the tooling and, through it, to every app built with it.

## Apps are static and frontend-only

The apps collect nothing and stay fully frontend-only: there is no hidden data collection on the platform
([returning use and praise to creators](https://lernapps.net/docs/platform-design/#2-design/d5-transactions.pdt42.md:el-ch-feedback)). They have no backend of their own and
send nothing to a server; storage is at most on the learner's device.

```arc42
:::constraint
id: con-frontend-only
title: Apps are static and frontend-only
category: technical
source: Platform design; listing criteria of the app overview
:::
```

## Rules for every page

Every page in every repo of the organisation sets no cookies, does no tracking and sends no requests to other servers
before a click; it is readable without JavaScript, meets WCAG 2.1 AA and is usable at 360 px. Pages on lernapps.net
link the imprint and the privacy notice. Archetypes that cannot be read without JavaScript as a whole (`interactive`)
keep a readable start page.

```arc42
:::constraint
id: con-page-rules
title: Rules for every page
category: convention
source: ORGANIZATION.md "Every page, in every repo"
:::
```

## GitHub is the means of production

The platform runs on GitHub: repositories, pull requests, GitHub Actions, GitHub Pages and Renovate
([platform](https://lernapps.net/docs/platform-design/#2-design/d1-ecosystem.pdt42.md:el-platform-lernapps)). Only the owner creates repositories in the organisation; a repo named `x` with Pages is served
at `lernapps.net/x/`. Actions are pinned to full commit SHAs and updated by Renovate.

```arc42
:::constraint
id: con-github
title: GitHub is the means of production
category: organizational
source: Platform design; ORGANIZATION.md "Rules across repos"
:::
```

## One owner, little time, no money

The platform is free, pays no one and has one owner whose time is the cost of maintaining the guidance
([list an app and hear it is used](https://lernapps.net/docs/platform-design/#2-design/d7-experiences.pdt42.md:el-x-list-and-hear-back)). There is no budget for paid services; the platform's only
service is a small one for anonymous thanks and feedback.

```arc42
:::constraint
id: con-one-owner
title: One owner, little time, no money
category: organizational
source: Platform design; GOVERNANCE.md
:::
```

## The listing is one entry in lernapps/apps

An app connects to the platform in one way only: its entry in the app overview links to it. The entry schema is owned
by lernapps/apps and published as JSON Schema; the owner decides whether an app is listed.

```arc42
:::constraint
id: con-entry-schema
title: The listing is one entry in lernapps/apps
category: organizational
source: ORGANIZATION.md "Apps and the app overview"
:::
```

## Languages and licence

Shared infrastructure is in English: names, identifiers, schemas, workflows, developer docs. Texts for learners,
teachers and parents are German, in plain language (ISO 24495-1). The tooling and apps generated from it are MIT
licensed; third-party content keeps its own licence and is named next to it.

```arc42
:::constraint
id: con-language-licence
title: Languages and licence
category: convention
source: ORGANIZATION.md "Language", "License"
:::
```
