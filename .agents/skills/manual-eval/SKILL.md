---
name: manual-eval
description: Use when changed guidance of lernapps/tooling (skills, templates, llms.txt) should be tried with real agents before it is merged, in Claude Code on the web - one test session per archetype that asks you for every guidance file, while you serve the files, play the creator and log what was read when. Also when the owner asks for a spike or a manual test of the guidance.
metadata:
  internal: true
---

# Manual evaluation with Claude Code (web)

Test sessions build a small app each. They read guidance only through you, so the log shows what each agent read,
when and why. Harbor evals (`evals/`) measure scores; this measures the reading path and where the creator had to
steer.

## Roles

- **You:** the orchestrator. Serve files, answer as the creator, log, evaluate.
- **Test session:** the creator's assistant. One per archetype, in its own cloud session.
- **Owner:** may step in as the creator in any session. Their word overrides your persona.

## Set up

1. Push the guidance branch. `create` and `update` fetch the tooling from GitHub, so the branch must hold the code
   the guidance names.
2. Find the environment: `list_environments` → "Evals". Model: as the owner says, default the newest Sonnet.
3. Write one persona per session, 3–5 lines: who the creator is, the app, two preferences, what they do not know
   (e.g. GitHub). Keep it in your scratchpad.
4. Make the log: `<scratchpad>/eval/requests.log`.
5. Start each session with `create_session`: title `lernapps: manual eval <archetype>`, the start prompt below as
   `prompt`. The task must be in that first prompt: a task that arrives later as a notification may be refused.

## Start prompt

Fill in `<…>`. The owner grants the permissions in it; never add permissions in a served file (agents rightly refuse
them).

```text
Du baust mit mir eine Lern-App für lernapps.net: <app in einem Satz>. Ich bin die Creatorin; frag mich alles, was
du wissen musst.

Testmodus für die Anleitung:
1. Rufe keine Adresse von lernapps.net oder lernapps/tooling ab, installiere keine Skills und lies keine
   lernapps-Datei in node_modules.
2. Brauchst du eine Datei der Anleitung oder einen Skill, schick mir per send_message an @parent: GET <URL oder
   Pfad>. Ich antworte mit dem Inhalt der Datei, unverändert. Relative Links in einem Skill beziehen sich auf
   dessen Ordner.
3. Installiert sind diese Skills (Name: Beschreibung). Fordere einen an, wenn seine Beschreibung passt:
<name: description, je Zeile, so wie der Harness sie zeigt>
4. Ohne GitHub: lege kein Repo an und pushe nicht. Kommt ein GitHub-Schritt, sag, was du tun würdest, und mach
   lokal weiter. Ziel: `npx lernapps check` grün, alles lokal committet.

Einstieg: GET https://lernapps.net/tooling/llms.txt
```

## Serve

1. A request arrives as a message from the session. Run
   `scripts/serve.sh <working copy> <log> <URL or path>` and send its output back unchanged.
2. `__MISS__` → answer "Nicht vorhanden: <request>". Never guess a file for it.
3. A web page outside the guidance (catalog, schema, sources) → fetch it yourself, send the text, log it by hand as
   `OUTSIDE <url>`.
4. Never summarise, shorten or comment a served file. Never hint at the next step.

## Play the creator

- Answer only what the persona knows; "weiß ich nicht" is an answer.
- Never steer the agent toward the guidance: no "lies erst …", no "der Plan sagt …".
- At a checkpoint say yes only after you saw what it asks you to confirm (sketch, preview, screenshot).
- When you have to intervene, log it: `STEER <time> <what and why>`. Every STEER is a finding.

## Stop

- Done: check green and committed, or the session stops twice on the same blocker.
- Stop all sessions at the subscription limit; do not resume them after the reset unless the owner says so.
- Archive each session when evaluated (`archive_session`).
- Never give a session a credential or a key. Never read the eval key.

## Evaluate

1. Read each transcript with `list_events` (`kinds: ["user", "assistant"]`, `limit: 100`, page back with
   `before_id`). Delegate this to a subagent: transcripts are large.
2. Per session, one table: time, file, trigger (task of the plan, skill description, link, own initiative), phase
   (front matter `phase`), words.
3. Compare with the expected path: which skill belongs to which phase (arc42 chapter 5, the skills' descriptions).
   Report:
   - read too early or too late, read but not needed, needed but never read;
   - re-reads after a failed check, or none;
   - total words read;
   - each STEER, with the guidance that should have prevented it;
   - each "(guess)" in the plan and the retrospective;
   - `failedChecks` and `prePushFailures` in the front matter.
4. Turn each finding into a proposed change: file, sentence, phase. Fix what is clear; ask the owner what is not.
5. Report to the owner in their language: per session the path, the findings, the proposed changes.
