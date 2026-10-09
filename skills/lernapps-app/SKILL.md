---
name: lernapps-app
description: Use when building or changing a learning app for lernapps.net. Holds the rules every listed app and every page on lernapps.net follows.
---

# Building a learning app for lernapps.net

This skill is still being written. Today it holds the rules of scope `listing` (every app in the app overview) and
`site` (every page served on lernapps.net). Follow each one; an `error` rule must not be broken. The review judges
further rules (`review/rubric.md` in lernapps/tooling); all rules are listed at <https://lernapps.net/tooling/rules/>.

## Rules

### Load nothing from other servers before a click

```rule
id: no-request-before-click
scope: [listing, site]
severity: error
enforcement: guided
```

Bundle scripts, styles, fonts, images and data with the app at build time. Load from another server only after the
learner clicks for it, e.g. a video that shows a button "Video von YouTube laden" first. Analytics, ad networks and
content delivery networks are never loaded.

### Collect nothing about learners

```rule
id: no-tracking
scope: [listing, site]
severity: error
enforcement: guided
```

Use no analytics service, no ad network, no tracking pixel and no fingerprinting. What the app stores stays in the
learner's browser and serves only the app, e.g. the progress of an exercise.

### Set no cookies

```rule
id: no-cookies
scope: site
severity: error
enforcement: guided
```

Set no cookies on lernapps.net. Keep state the app needs in `localStorage` or `sessionStorage`, and only for the
app itself. The [privacy notice](https://lernapps.net/privacy/) states this for all of lernapps.net.

### Readable without JavaScript

```rule
id: readable-without-javascript
scope: site
severity: error
enforcement: guided
```

Every page shows its text without JavaScript: the title, what the app is for and how to use it. Interactive parts
may need JavaScript; say so in the page when it is off.

### Accessible to WCAG 2.1 AA

```rule
id: wcag-aa
scope: site
severity: error
enforcement: guided
```

Meet WCAG 2.1 level AA: enough contrast, every control usable with the keyboard and named for screen readers,
images with a text alternative, the page language set.

### Usable at 360 pixels

```rule
id: usable-at-360px
scope: site
severity: error
enforcement: guided
```

Every page works on a screen 360 CSS pixels wide, without horizontal scrolling and with every control reachable.

### Link the imprint and the privacy notice

```rule
id: legal-links
scope: site
severity: error
enforcement: guided
```

Every page links the [imprint](https://lernapps.net/imprint/) and the [privacy notice](https://lernapps.net/privacy/).
The shared site frame of lernapps.net adds both links to its footer.
