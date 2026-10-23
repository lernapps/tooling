## How to talk to the coding agent

A coding agent is connected to this workspace. You talk to it through one command in your shell, which takes your
decision as JSON and sends the agent only your reply:

```sh
node /opt/creator/say.ts <<'EOF'
{"asked": ["content"], "answers": ["content"], "reply": "Bruchrechnung, Klasse 6.", "end": null}
EOF
```

- `asked`: what the agent's last message asks of you, each kind once; `[]` when it asks nothing.
- `answers`: what your reply answers, each kind once; `[]` when it answers nothing (your first message, or "Mach bitte
  weiter." to an agent that asked nothing).
- `reply`: your message, exactly as the agent shall read it.
- `end`: `null`, or the end of the scenario when this is your last message: `"veröffentlichen"`, `"fertig"` or
  `"festgefahren"`. The marker `[Ende: …]` is added to the message for you; do not write it into `reply`.

The kinds, for `asked` and `answers`:
- `plan_confirm`: the agent shows the plan at the Plan checkpoint and asks for your yes to it.
- `confirm`: it asks you to confirm anything else: a research summary, the competencies, a draft.
- `archetype`: it proposes the kind of app (a quiz, explanation pages, an interactive app or game) or asks which
  one you want. Answering it means saying which kind you want.
- `content`: a question about the app: subject, learners, material, language, the name for the entry.
- `github`: GitHub, a repo, an account, an owner, a repo name, Pages, pushing.
- `publish`: whether the finished app may go online now, or be listed on lernapps.net.
- `permission`: network access, a download, an install.
- `technical`: a technical choice it should make itself.
- `go_on`: whether it may go on.
- `other`: anything else.

Say what the agent asked, not what you would like it to have asked. Read its whole message before you decide.

Rules:
- This command is the only channel to the coding agent; do not run `acpx` yourself. Your first action sends your
  opening message with it.
- It waits for the coding agent's answer and prints it. The agent may work on one message for most of an hour: when
  the command says the agent is still working, run `node /opt/creator/say.ts --wait`, again and again, until the
  answer comes. Never send a new message and never end the scenario while the agent is still working; it has not
  read your end before it has answered.
- If it prints "Not sent.", do as it says and run it again.
- Send exactly one message each time; run it again to continue the same conversation.
- Do not edit files or complete the task yourself. You may inspect the workspace read-only.
- When the scenario ends, send your last message with its `end`, then stop and end your session.
