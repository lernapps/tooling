# Platform rules

What every learning app on lernapps.net keeps to, however it is built: with the lernapps tooling, by hand, with
another framework or with a tool such as Lovable or bolt.new. Each rule is a section headed by its rule block: its
`id`, its `scope` (`listing`: every listed app, wherever it is hosted) and its `severity` (`error` must not be broken;
`hint` is a recommendation). Check messages and the review of the listing name the rules by id; all rules:
<https://lernapps.net/tooling/rules/>.

The app lives at its own address, for example the GitHub Pages of its repo (`https://<owner>.github.io/<repo>/`), and
the catalog links to it. Check a built app or the published one with
`npx --yes github:lernapps/tooling#main check <dir|url>`, the command the rules below call `lernapps check`; add
`--entry <file>` to check the catalog entry against the app.

## The app

### `no-tracking`: Collect nothing, set no cookies

```rule
id: no-tracking
scope: listing
severity: error
```

No cookies, no analytics, no tracking pixels, no server that stores data. If the app stores anything, it stays on
the device (`localStorage`) and serves only the app.

### `runs-in-browser`: Runs in the browser, without installation

```rule
id: runs-in-browser
scope: listing
severity: error
```

The app opens at its URL in a current browser and works there. Nothing to install: no app store, no download, no
browser extension.

### `app-checkable`: The published app can be opened and checked

```rule
id: app-checkable
scope: listing
severity: error
```

The app opens at the entry's `url`, so that `lernapps check` can visit its pages; a built app opens from its bundle
(`index.html`). An app that cannot be opened cannot be checked, and learners cannot use it either. When the page does
not load, the app's build fails, no browser can start or the check stops, the checks report this rule instead
of the others. Fix the app so that it opens at the entry's `url`, then check again. When the app opens in a browser but the
check itself fails, open an issue at <https://github.com/lernapps/tooling/issues> with the message.

### `no-account`: No account

```rule
id: no-account
scope: listing
severity: error
```

Learners and teachers use the whole app without signing up or logging in.

### `free-of-charge`: Free of charge

```rule
id: free-of-charge
scope: listing
severity: error
```

Every part of the app is free: no payment, no paid upgrade, no trial that ends.

### `no-ads`: No ads

```rule
id: no-ads
scope: listing
severity: error
```

Show no advertising, no sponsored content, no product placement.

### `learners-act`: Learners do something themselves

```rule
id: learners-act
scope: listing
severity: error
```

Learners try, practise or decide in the app; reading alone is not enough. Each page or screen asks them to act.

### `no-request-before-click`: No request to another server before a click

```rule
id: no-request-before-click
scope: listing
severity: error
```

Bundle fonts, scripts and pictures at build time. Load anything from another server (a video, a map) only after the
learner clicks for it. Keep URLs of other servers out of code; where the learner clicks to load one, suppress the lint
message on that line with this reason.

### `accessible`: Accessible to WCAG 2.1 AA

```rule
id: accessible
scope: listing
severity: error
```

Meet WCAG 2.1 AA: labels, contrast, keyboard use, text alternatives. Only where the app's idea needs it (a typing game
against the clock) may it deviate: then say in plain German what it does not offer in the entry's field `limits`,
which teachers and parents read in the catalog. With `limits` in the entry, `lernapps check --entry` reports this
rule's findings as warnings; without it, as errors.

### `usable-at-360px`: Usable at 360 px

```rule
id: usable-at-360px
scope: listing
severity: error
```

Every page works at 360 px width without horizontal scrolling, with every control reachable. Only where the app's idea
needs it (a keyboard is required) may it deviate, said in the entry's field `limits` as under `accessible`; with it,
`lernapps check --entry` reports this rule's findings as warnings, without it as errors.

### `learner-text-german`: German always, every declared language complete

```rule
id: learner-text-german
scope: listing
severity: error
```

Write every text for learners, teachers and parents in German, in plain language: short sentences, active voice, no
jargon. German is always there. An app may add further languages where its archetype supports them (the explainer
and the quiz: `languages`, German first); then every text is complete in each declared language, and in no other.
Keep the texts out of code: in the content of a deep archetype (an explainer's YAML, a quiz's question bank), or in
message files, e.g. `src/messages/de.json`, shown with `translator` from `@lernapps/tooling/i18n`.

### `third-party-licence`: Name source and licence of others' content

```rule
id: third-party-licence
scope: listing
severity: error
```

Use content of others (texts, pictures, quotes) only with a licence that allows it, and name source and licence next
to it.

### `dependency-licence`: Only dependencies with an open licence

```rule
id: dependency-licence
scope: listing
severity: error
```

Add a package to `dependencies` only if it and its own dependencies have one of these licences: MIT, MIT-0, ISC,
0BSD, BSD-2-Clause, BSD-3-Clause, Apache-2.0, MPL-2.0, BlueOak-1.0.0, Zlib, Unlicense, CC0-1.0, CC-BY-4.0,
Python-2.0. Tools for the build belong in `devDependencies`.

### `links-resolve`: Every link resolves

```rule
id: links-resolve
scope: listing
severity: error
```

Point every link and every resource (pictures, scripts, styles) to a page or file that the build writes. Use
relative links inside the app.

### `pages-reachable`: Every page is reachable from the start page

```rule
id: pages-reachable
scope: listing
severity: error
```

Link every page the build writes from the start page or from a page it leads to: learners find only what links reach,
and the checks of the listing, which open the app at its address, check only those pages. Leave pages nobody should
reach out of the build. A page reached another way on purpose gets
`<meta name="robots" content="noindex">`; a `404.html` at the root is the host's page for addresses that do not exist
and needs no link. On a URL the checks visit at most 100 pages; a hint then says so: check the bundle to check every
page.

### `no-learner-data-in-texts`: Nothing about a particular learner in public texts

```rule
id: no-learner-data-in-texts
scope: listing
severity: error
```

Write no name, class, school, grade, picture or other detail of a real learner into the app, the entry, the README,
the plan or a commit message, even when the creator mentions one. Use made-up names in exercises.

### `correct-content-support`: Help keep the content correct

```rule
id: correct-content-support
scope: listing
severity: hint
```

Where answers are computable, generate the exercises and test the answers with a checker. Name a source learners and
teachers can follow for facts. This should be done where it fits; it is never a condition for listing.

## The catalog entry

The entry lists the app in the catalog, by a pull request to <https://github.com/lernapps/apps>; the skill
`lernapps-listing` has the steps.

### `entry-from-schema`: Fill the entry from the published schema

```rule
id: entry-from-schema
scope: listing
severity: error
```

Fetch the entry schema each time you need it; never fill the entry from memory or from another app. Take every value
from the creator's answers, the plan or the app; never invent one.

### `entry-links-resolve`: Every link of the entry resolves

```rule
id: entry-links-resolve
scope: listing
severity: error
```

Give each topic the path of a page that exists, relative to the app's `url`; a topic that links a section of a page
(`<page>#<section>`) names the id of an element on that page. Check the entry against the deployed app with
`lernapps check --entry <file>`.

### `entry-fitness-matches`: Fitness values as measured

```rule
id: entry-fitness-matches
scope: listing
severity: error
```

Take `fitness.storage` and `fitness.thirdParty` from what the app does, not from what it should do: `lernapps check
--report <file>` measures what it does before a click. An app that keeps anything in `localStorage` has
`storage: device`; one that loads from another server after a click has `thirdParty: on-click`.
