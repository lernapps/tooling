# Review rubric

The rules no program decides: the review agent judges each item for an app that asks to be listed, starting from
the validation report. This rubric is still being written; the prompt and the format of the verdict follow. Each
item is a section headed by its rule block; the verdict names the rule id of every finding.

## Runs in the browser, without installation

```rule
id: runs-in-browser
scope: listing
severity: error
enforcement: reviewed
```

The app opens at its URL in a current browser and works there. Nothing needs to be installed: no app store, no
download, no browser extension.

## No account needed

```rule
id: no-account
scope: listing
severity: error
enforcement: reviewed
```

Learners and teachers use the whole app without signing up or logging in.

## Free of charge

```rule
id: free-of-charge
scope: listing
severity: error
enforcement: reviewed
```

Every part of the app is free. No payment, no paid upgrade, no trial that ends.

## No ads

```rule
id: no-ads
scope: listing
severity: error
enforcement: reviewed
```

The app shows no advertising, no sponsored content and no product placement.

## Learners act themselves

```rule
id: learners-act
scope: listing
severity: error
enforcement: reviewed
```

Learners do something in the app: they try things out, practise or decide. An app that only shows text or videos
is not listed.
