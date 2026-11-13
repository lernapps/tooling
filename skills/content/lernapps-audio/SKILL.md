---
name: lernapps-audio
description: Use in Code whenever a language explainer of lernapps.net needs spoken audio - a dictation or listening task (`audio` in a `language-task` item) or a speaking task (`speaking-task`) - or an audio file in src/audio/ must be made again. Which voices are allowed, what the creator must know and allow first, the script that makes the MP3 files, and how to check and reference them.
license: MIT
---

# Audio for language tasks

- Dictation, listening and speaking tasks play synthetic speech. You make the files while you write the app, with
  [scripts/lernapps_audio.py](scripts/lernapps_audio.py), and commit them in `src/audio/`. The build needs no model.
- Only the voices in [references/voices.md](references/voices.md) are allowed; the script refuses others (exit 3).
  Nothing else here: no Whisper, no speech recognition, no other tools.

## Before you generate: tell the creator

Say this in a few lines, then wait for the yes (the first run downloads a lot):

- Needed once, on the creator's machine or in the sandbox: Python 3.10+, `ffmpeg` (or 65 MB more for a pip copy),
  about 0.6 GB download and 0.8 GB disk, in `~/.cache/lernapps/audio/`, never in the app.
- The network must allow `pypi.org`, `files.pythonhosted.org`, `github.com` with its release CDN
  (`release-assets.githubusercontent.com`) and `huggingface.co` with its CDN (`*.hf.co`).
- The creator picks one of the allowed voices for the app's language (English: US or GB, female or male). Show them
  the choices of that language from `voices`, not the whole list.

## Steps

1. `python3 .agents/skills/lernapps-audio/scripts/lernapps_audio.py preflight`. It lists all problems at once, one
   line each: "what is missing — what to do". Exit 2: fix them, or `preflight --install` once the creator agreed.
   A blocked host: ask the creator to allow it.
2. `... generate --lang fr --voice ff_siwis --text "Bonjour." --out src/audio/bonjour.mp3`. Many sentences:
   `--batch sentences.json` with `[{"text": "…", "out": "src/audio/….mp3"}]`, plus `--lang`/`--voice` (English also
   `--accent us|gb`). Names: lowercase, `.mp3`. An existing file is kept unless `--force`. Exit 3: voice not
   allowed; 4: failed (the line says why).
3. Listen to every file, and let the creator listen. The person who approves must speak the language. The approval is
   the git commit, nothing else; the files carry no approval field and no name.
4. Reference the files, then `lernapps check` and commit them with the app.

## Writing the text

- The spoken text is the answer: the build compares the file's text with the task's answers and stops if it is none
  of them. Write the sentence exactly as the learner shall type it.
- No single words. A voice makes a lone word badly. With its article ("le pain", "la pomme") it is mostly good, and in a
  short sentence ("Le pain est bon.") it is better and helps the learner too: the word is heard in use. So give each
  word a short sentence as its text, the sentence is then what the learner types or says. Listen to any file with a
  lone word twice.
- Traps for the voice: numbers ("1998", "3,5", "2nd": write them out in words), names and loan words, abbreviations,
  French liaison and silent endings. The voice says it wrong → respell the word or rewrite the sentence, then make
  the file again with `--force`. Short sentences sound better than long ones.
- Speed stays 1.0: learners slow it down in the player.

## In the app

- Dictation or listening: an item of a `language-task` starts from `audio` instead of the other side
  (`direction`, `mode`, `form` as usual: skill `lernapps-explainer`, `references/language-tasks.md`):

```yaml
- audio: je-mappelle.mp3
  target: "Je m'appelle (Marie|Paul)."
```

- `direction: to-source` (listen, then write the translation): the item has `audio` and `source`, no `target`.
  A gap dictation is `mode: gap` with the gaps in `target`: `target: "Je [suis] de [Berlin]."`.
- Speaking, compare with the model: block `speaking-task`. The learner records themself, plays the original, the
  recording or both, and rates the pronunciation (it is not in a chapter's self-assessment: the build says so):

```yaml
- type: speaking-task
  id: nachsprechen
  language: fr
  items:
    - audio: je-mappelle.mp3
      text: "Je m'appelle Marie."   # optional: the sentence to read aloud; it must be what the file says
```

- The file name has no folder: files live in `src/audio/`. Every sentence needs its own file.
- The page "Medienübersicht" (`medien/`) lists every image, audio file and video with credit, licence and, for speech
  a model made, the AI voice, model and text. Look there when you review the audio of an app.

## The files

- MP3, mono, 24 kHz, 48 kbit/s. The script writes the AI mark and the data of the voice into the file (ID3: language,
  licence `CC BY-SA 4.0`, date, `lernapps-synthetic`, model, voice, attribution, text) and reads them back; a missing
  field is exit 4. The build needs them and shows them on the player and in the media overview.
- Never edit, convert or re-tag a file with another tool: it drops the fields and the build then stops. Make it again.
