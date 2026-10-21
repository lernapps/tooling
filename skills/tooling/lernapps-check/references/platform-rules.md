# Platform rules

- Every app on lernapps.net, however built (this tooling, by hand, another framework, Lovable, bolt.new).
- Scope `listing`: every listed app, wherever hosted. Severity `error` never break; `hint` advice.
- Check a built or published app: `npx --yes github:lernapps/tooling check <dir|url>` (= `lernapps check`);
  `--entry <file>` checks the catalog entry against it.
- Published at its own address (e.g. `https://<owner>.github.io/<repo>/`); once listed, lernapps.net serves a copy at
  `https://lernapps.net/apps/start/<id>/`, built from the entry's `commit`.
- All rules: <https://lernapps.net/tooling/rules/>.

## App

### `no-tracking`: Collect nothing, set no cookies

```rule
id: no-tracking
scope: listing
severity: error
```

- No cookies, analytics, tracking pixels, server storing data.
- Stored data stays on the device (`localStorage`) and serves only the app.

### `own-data-only`: Touch only the app's own data in the browser

```rule
id: own-data-only
scope: listing
severity: error
```

- Every app on lernapps.net shares one origin with the other apps and the platform.
- Own data: keys of `localStorage` and `sessionStorage`, IndexedDB databases and caches named `lernapps:<id>:…`,
  `<id>` the app's id in the catalog (`entries/<id>.yaml`).
- Never read, write or remove other keys; never `clear()`; never `caches.match()` without `cacheName`.
- Built with this tooling: `createStorage("<id>")` from `@lernapps/tooling/storage`.
- `lernapps check` puts another app's data into the browser and reports every access to it, before a click.

### `runs-in-browser`: Runs in the browser, without installation

```rule
id: runs-in-browser
scope: listing
severity: error
```

- Opens and works at its URL in a current browser. No app store, download or extension.

### `app-checkable`: The published app can be opened and checked

```rule
id: app-checkable
scope: listing
severity: error
```

- Opens at the entry's `url`; a built app from its bundle (`index.html`).
- Page does not load, build fails, no browser, check stops → only this rule is reported. Fix, check again.
- Opens in a browser but the check fails → issue at <https://github.com/lernapps/tooling/issues> with the message.

### `no-account`: No account

```rule
id: no-account
scope: listing
severity: error
```

- Whole app usable without sign-up or login.

### `free-of-charge`: Free of charge

```rule
id: free-of-charge
scope: listing
severity: error
```

- Every part free: no payment, paid upgrade or ending trial.

### `no-ads`: No ads

```rule
id: no-ads
scope: listing
severity: error
```

- No advertising, sponsored content or product placement.

### `learners-act`: Learners do something themselves

```rule
id: learners-act
scope: listing
severity: error
```

- Every page or screen asks learners to try, practise or decide. Reading alone is not enough.

### `no-request-before-click`: No request to another server before a click

```rule
id: no-request-before-click
scope: listing
severity: error
```

- Bundle fonts, scripts, pictures at build time.
- Other servers (video, map) only after the learner's click.
- No other servers' URLs in code; at a click-to-load line suppress the lint message with this reason.

### `accessible`: Accessible to WCAG 2.1 AA

```rule
id: accessible
scope: listing
severity: error
```

- WCAG 2.1 AA: labels, contrast, keyboard, text alternatives.
- Deviate only where the idea needs it (typing game against the clock); then say what is missing, in plain German,
  in the entry's `limits`.
- With `limits`: `lernapps check --entry` reports warnings; without: errors.

### `usable-at-360px`: Usable at 360 px

```rule
id: usable-at-360px
scope: listing
severity: error
```

- Every page at 360 px width: no horizontal scrolling, every control reachable.
- Deviate only where the idea needs it (keyboard required), in `limits` as under `accessible`.

### `learner-text-german`: German always, every declared language complete

```rule
id: learner-text-german
scope: listing
severity: error
```

- Texts for learners, teachers, parents: German, plain (short sentences, active voice, no jargon).
- More languages only where the archetype supports them (explainer, quiz: `languages`, German first); each declared
  language complete, no other.
- Texts out of code: in the content (explainer YAML, quiz bank) or message files (`src/messages/de.json`, shown
  with `translator` from `@lernapps/tooling/i18n`).

### `third-party-licence`: Name source and licence of others' content

```rule
id: third-party-licence
scope: listing
severity: error
```

- Others' content (texts, pictures, quotes) only with a licence that allows it; source and licence next to it.

### `dependency-licence`: Only dependencies with an open licence

```rule
id: dependency-licence
scope: listing
severity: error
```

- `dependencies` only with these licences, transitively: MIT, MIT-0, ISC, 0BSD, BSD-2-Clause, BSD-3-Clause,
  Apache-2.0, MPL-2.0, BlueOak-1.0.0, Zlib, Unlicense, CC0-1.0, CC-BY-4.0, Python-2.0.
- Build tools: `devDependencies`.

### `links-resolve`: Every link resolves

```rule
id: links-resolve
scope: listing
severity: error
```

- Every link and resource points to a page or file the build writes. Relative links inside the app.

### `pages-reachable`: Every page is reachable from the start page

```rule
id: pages-reachable
scope: listing
severity: error
```

- Every built page linked from the start page or a page it leads to; the listing checks only those.
- Pages nobody should reach: out of the build. Reached otherwise on purpose: `<meta name="robots" content="noindex">`.
- `404.html` at the root needs no link.
- On a URL the checks visit at most 100 pages (hint); check the bundle for all.

### `no-learner-data-in-texts`: Nothing about a particular learner in public texts

```rule
id: no-learner-data-in-texts
scope: listing
severity: error
```

- No name, class, school, grade, picture or other detail of a real learner in app, entry, README, plan or commit
  message, even if the creator mentions one. Made-up names in exercises.

### `correct-content-support`: Help keep the content correct

```rule
id: correct-content-support
scope: listing
severity: hint
```

- Computable answers: generate exercises, test answers with a checker.
- Name a source for facts. Where it fits; never a listing condition.

## Catalog entry

- Listed by a pull request to <https://github.com/lernapps/apps>; steps: skill `lernapps-listing`.

### `entry-from-schema`: Fill the entry from the published schema

```rule
id: entry-from-schema
scope: listing
severity: error
```

- Fetch the entry schema each time; never from memory or another app.
- Every value from the creator's answers, the plan or the app; never invented.

### `entry-links-resolve`: Every link of the entry resolves

```rule
id: entry-links-resolve
scope: listing
severity: error
```

- Each topic: path of an existing page, relative to the app's `url`; `<page>#<section>` names an element id there.
- Check against the deployed app: `lernapps check --entry <file>`.

### `entry-fitness-matches`: Fitness values as measured

```rule
id: entry-fitness-matches
scope: listing
severity: error
```

- `fitness.storage`, `fitness.thirdParty` from what the app does; `lernapps check --report <file>` measures it.
- Anything in `localStorage` → `storage: device`; loads from another server after a click → `thirdParty: on-click`.
