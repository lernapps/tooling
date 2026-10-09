# Review rubric: every app

The rules no program decides. The review agent judges each item below for every app that asks to be listed, then
the items of the app's archetype (`review/archetypes/<archetype>.md`). It starts from the validation report: a rule
the checks already decided is not judged again. Each item's `rubric` block names its rule id; the skill section of
the same id (`skills/lernapps-app/SKILL.md`) says the rule's scope and severity, and a finding has that severity.
Every level-2 heading of a rubric file is an item and carries its rubric block.

## Runs in the browser, without installation

```rubric
id: runs-in-browser
```

Read the start page and the texts of the bundle. A finding: the app asks to install something (an app from a store, a
download, a browser extension, a program) before it can be used, or works only in one browser.

## No account needed

```rubric
id: no-account
```

Read the bundle for login and sign-up forms, and for parts of the app behind them. A finding: any part of the app
needs an account, for learners or for teachers.

## Free of charge

```rubric
id: free-of-charge
```

Read the texts and links of the bundle. A finding: a price, a payment, a paid upgrade, a trial that ends, a part of
the app locked until someone pays.

## No ads

```rubric
id: no-ads
```

Read every page of the bundle, including pictures and their text alternatives. A finding: advertising, a sponsored
text or link, a product placement, a link to a shop or a paid offer that the learning content does not need. Texts
marked "Anzeige", "Werbung", "gesponsert" or "Partnerlink" are always a finding. Name the page and the element.

## Learners act themselves

```rubric
id: learners-act
```

Open the pages as a learner would. A finding: a page or screen where learners only read or watch, with nothing to
try, practise or decide. An exercise with its solution behind a click counts as acting; a text with a video alone
does not. The archetype's rubric says what acting means there.

## Plain language

```rubric
id: learner-text-german
```

Read the texts for learners, teachers and parents. A finding: a text that is not German; long nested sentences,
passive voice where the learner should act, jargon a learner of the stated age does not know, or a term used before
it is explained. Quote the sentence and give a plainer one as the fix.

## No learner-specific data in public texts

```rubric
id: no-learner-data-in-texts
```

Read every public text: the pages of the bundle, the entry, the repo's README, the plan file, commit messages in the
reviewed history. A finding: the name, class, school, grades, picture or anything else about a particular learner,
real or recognisable. Made-up names in exercises ("Mia teilt 12 Äpfel") are fine.

## Collects nothing, also after a click

```rubric
id: no-tracking
```

The check sees the app only before a click. Read the bundle's scripts and the dependencies (`package.json`, the lock
file) for what happens after one. A finding: an analytics or tracking library, a request that sends what learners
enter or do to a server, an identifier stored to recognise a learner, a form that submits to another server.

## Content of others named, with its licence

```rubric
id: third-party-licence
```

Read the bundle for texts, pictures, quotes, videos and data that the creator did not make, and the plan's notes on
where the content comes from. A finding: content of others without its source and licence next to it, or with a
licence that does not allow its use in the app.

## Retrospective filled

```rubric
id: retrospective-filled
```

Read the retrospective at the end of the plan file (`.vibe/plan.md`). A finding: a part left empty or with the
template's comments only, or a statement the history contradicts (e.g. no failed checks, but `prePushFailures` is
above 0). An app without a plan file was not built with the tooling: judge nothing here. Each place listed under
"Where I had to guess" is a gap in the guidance: propose a rule for it where one would have helped.

## Support for correct content

```rubric
id: correct-content-support
```

Correct content is suggested, never a condition for listing. Read the tests in the repo and the sources named in the
app. A finding of severity hint: exercises with computable answers and no test that checks the answers, or facts
without a source learners or teachers can follow.
