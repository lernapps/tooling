# Voices

Only these. The owner chose them by listening. The script writes the attribution into the file (`lernapps-attribution`);
the build lists it in the media overview. `voices --json` prints this table.

| Language | `--lang` / `--accent` | Voice | Gender | Engine | Licence | Attribution in the file |
|---|---|---|---|---|---|---|
| English US | `en` / `us` | `af_sarah`, `af_nova`, `af_sky` | female | Kokoro | Apache-2.0 | `none` |
| English US | `en` / `us` | `am_eric`, `am_puck` | male | Kokoro | Apache-2.0 | `none` |
| English GB | `en` / `gb` | `bf_emma`, `bf_isabella`, `bf_lily` | female | Kokoro | Apache-2.0 | `none` |
| English GB | `en` / `gb` | `bm_george`, `bm_daniel` | male | Kokoro | Apache-2.0 | `none` |
| French | `fr` | `ff_siwis` | female | Kokoro | Apache-2.0; trained with SIWIS (CC BY 4.0) | `SIWIS corpus, CC BY 4.0, University of Edinburgh` |
| French | `fr` | `pierre` | male | Piper `fr_FR-upmc-medium`, speaker 1 | dataset CC BY-SA 4.0 | `UPMC Pierre voice data, CC BY-SA 4.0` |
| Spanish | `es` | `ef_dora` | female | Kokoro | Apache-2.0 | `none` |
| Spanish | `es` | `em_alex` | male | Kokoro | Apache-2.0 | `none` |
| Italian | `it` | `if_sara` | female | Kokoro | Apache-2.0 | `none` |
| Italian | `it` | `im_nicola` | male | Kokoro | Apache-2.0 | `none` |

- Not allowed, for example: `jessica` (the other speaker of the Piper model), every other Kokoro voice.
- Kokoro (`kokoro-v1.0`): weights Apache-2.0. Its model card says it was trained partly on CC BY data (SIWIS, Koniwa).
  Only `ff_siwis` is known to need a name; for the others the model card names no duty beyond the model, hence `none`.
- Sources: SIWIS corpus, https://datashare.ed.ac.uk/handle/10283/2353; UPMC Pierre,
  https://github.com/marytts/upmc-pierre-data. The Piper package (`piper-tts`) is GPL-3.0 software that runs in the
  cache; it is not part of an app.
- A new voice or a changed attribution is the owner's decision: change this table and `VOICES` in the script together.
