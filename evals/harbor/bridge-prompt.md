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
- It blocks until the coding agent finishes its turn and prints its answer; long waits are normal. If it prints
  "Not sent.", fix the JSON as it says and run it again.
- Send exactly one message each time; run it again to continue the same conversation.
- Do not edit files or complete the task yourself. You may inspect the workspace read-only.
- When the scenario ends, send your last message with its `end`, then stop and end your session.
