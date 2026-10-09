# Review rubric

The rules no program decides: the review agent judges each item for an app that asks to be listed, starting from
the validation report. This rubric is still being written; the prompt and the format of the verdict follow. Each
item's `rubric` block names its rule id, the same id as where a skill tells the rule (`skills/lernapps-app/SKILL.md`),
and the verdict names the rule id of every finding.

## Runs in the browser, without installation

```rubric
id: runs-in-browser
```

The app opens at its URL in a current browser and works there. Nothing needs to be installed: no app store, no
download, no browser extension.

## No account needed

```rubric
id: no-account
```

Learners and teachers use the whole app without signing up or logging in.

## Free of charge

```rubric
id: free-of-charge
```

Every part of the app is free. No payment, no paid upgrade, no trial that ends.

## No ads

```rubric
id: no-ads
```

The app shows no advertising, no sponsored content and no product placement.

## Learners act themselves

```rubric
id: learners-act
```

Learners do something in the app: they try things out, practise or decide. An app that only shows text or videos
is not listed.
