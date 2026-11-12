// The audio skill's script (skills/content/lernapps-audio/scripts/lernapps_audio.py), without network and without
// models: the voice list, the preflight report, the refusals, and the ID3 fields (written by ffmpeg, read back).
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, test } from "vite-plus/test";
import { repoRoot } from "./repo-copy.ts";

const SCRIPT = join(repoRoot, "skills/content/lernapps-audio/scripts/lernapps_audio.py");
const scratch = mkdtempSync(join(tmpdir(), "audio-skill-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** Runs python3 with an empty cache directory, so that nothing is installed and nothing is downloaded. */
const python = (args: string[], env: NodeJS.ProcessEnv = {}) => {
  const result = spawnSync("python3", ["-I", ...args], {
    encoding: "utf8",
    env: { ...process.env, LERNAPPS_AUDIO_HOME: join(scratch, "cache"), LERNAPPS_AUDIO_OFFLINE: "1", ...env },
  });
  return { code: result.status ?? -1, stdout: result.stdout, stderr: result.stderr };
};
const script = (...args: string[]) => python([SCRIPT, ...args]);
const hasPython = spawnSync("python3", ["--version"]).status === 0;
const hasFfmpeg = spawnSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8" }).stdout?.includes(
  "libmp3lame",
);

describe.skipIf(!hasPython)("lernapps_audio.py", () => {
  test("voices --json lists exactly the allowed voices, with the attribution the build shows", () => {
    const result = script("voices", "--json");
    expect(result.code).toBe(0);
    const rows = JSON.parse(result.stdout) as { voice: string; lang: string; engine: string; attribution: string }[];
    expect(rows.map((row) => row.voice).sort()).toEqual(
      [
        "af_sarah",
        "af_nova",
        "af_sky",
        "am_eric",
        "am_puck",
        "bf_emma",
        "bf_isabella",
        "bf_lily",
        "bm_george",
        "bm_daniel",
        "ff_siwis",
        "pierre",
        "ef_dora",
        "em_alex",
        "if_sara",
        "im_nicola",
      ].sort(),
    );
    const by = Object.fromEntries(rows.map((row) => [row.voice, row]));
    expect(by["ff_siwis"]?.attribution).toBe("SIWIS corpus, CC BY 4.0, University of Edinburgh");
    expect(by["pierre"]).toMatchObject({ engine: "piper", attribution: "UPMC Pierre voice data, CC BY-SA 4.0" });
    expect(by["af_sarah"]?.attribution).toBe("none");
  });

  test("the voices in references/voices.md are the voices of the script", () => {
    const table = spawnSync("grep", ["-o", "`[a-z]*_[a-z]*`\\|`pierre`", "references/voices.md"], {
      cwd: join(repoRoot, "skills/content/lernapps-audio"),
      encoding: "utf8",
    }).stdout;
    const documented = [
      ...new Set(
        table
          .split("\n")
          .map((name) => name.replaceAll("`", ""))
          .filter(Boolean),
      ),
    ];
    const listed = (JSON.parse(script("voices", "--json").stdout) as { voice: string }[]).map((row) => row.voice);
    expect(documented.filter((name) => name !== "jessica").sort()).toEqual(listed.sort());
  });

  test("preflight --json reports every problem at once, as data, with exit 2 and no traceback", () => {
    const result = script("preflight", "--json");
    expect(result.stderr).not.toContain("Traceback");
    expect([0, 2]).toContain(result.code);
    const report = JSON.parse(result.stdout) as {
      ok: boolean;
      checks: { id: string }[];
      problems: { message: string }[];
    };
    expect(report.ok).toBe(result.code === 0);
    // an empty cache has no venv and no models: all of that is named in one report
    expect(report.checks.map((check) => check.id)).toEqual(
      expect.arrayContaining(["python", "packages", "ffmpeg", "disk"]),
    );
    expect(report.problems.length).toBeGreaterThanOrEqual(2);
    for (const problem of report.problems) expect(problem.message).toContain(" — ");
  });

  test("a voice that is not on the list, or not for the language or accent, exits 3 before any work", () => {
    const base = ["generate", "--text", "Bonjour.", "--out", join(scratch, "x.mp3")];
    for (const args of [
      ["--lang", "fr", "--voice", "jessica"],
      ["--lang", "fr", "--voice", "af_sarah"],
      ["--lang", "en", "--voice", "bf_emma", "--accent", "us"],
    ]) {
      const result = script(...base, ...args);
      expect(result.code, args.join(" ")).toBe(3);
      expect(result.stderr).not.toContain("Traceback");
    }
  });

  test("with a valid voice but an empty cache, generate exits 2 and says what is missing", () => {
    const result = script(
      "generate",
      "--lang",
      "fr",
      "--voice",
      "ff_siwis",
      "--text",
      "Bonjour.",
      "--out",
      join(scratch, "y.mp3"),
    );
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("missing:");
    expect(result.stderr).not.toContain("Traceback");
  });

  test("usage errors exit 64, never 2: a bad file name, a speed out of range", () => {
    const voice = ["--lang", "fr", "--voice", "ff_siwis", "--text", "Bonjour."];
    expect(script("generate", ...voice, "--out", join(scratch, "Bad Name.mp3")).code).toBe(64);
    expect(script("generate", ...voice, "--out", join(scratch, "a.mp3"), "--speed", "9").code).toBe(64);
    expect(script("generate", "--nonsense").code).toBe(64);
  });

  test("a batch file is read before anything runs: a wrong voice in it exits 3", () => {
    const batch = join(scratch, "batch.json");
    writeFileSync(
      batch,
      JSON.stringify({
        lang: "fr",
        voice: "ff_siwis",
        items: [{ text: "Oui.", out: join(scratch, "o.mp3"), voice: "x" }],
      }),
    );
    expect(script("generate", "--batch", batch).code).toBe(3);
  });

  test.skipIf(!hasFfmpeg)("the ID3 fields ffmpeg writes read back, and a missing or changed field is found", () => {
    const code = `
import importlib.util, json, math, shutil, struct, sys, wave
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("lernapps_audio", sys.argv[1])
audio = importlib.util.module_from_spec(spec); spec.loader.exec_module(audio)
from pathlib import Path
tmp = Path(sys.argv[2])
with wave.open(str(tmp / "tone.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(22050)
    w.writeframes(b"".join(struct.pack("<h", int(8000 * math.sin(i / 8))) for i in range(22050)))
text = "Où est l'école? Là-bas, à côté de la gare."
tags = audio.build_tags("pierre", text, "2026-11-12")
out = tmp / "tone.mp3"
audio.encode_mp3(shutil.which("ffmpeg"), tmp / "tone.wav", out, tags)
ok = audio.verify_mp3(out, tags)
other = dict(tags, **{"lernapps-voice": "ff_siwis"})
changed = audio.verify_mp3(out, other)
frames, _ = audio.read_id3(out)
print(json.dumps({"ok": ok, "changed": changed, "frames": frames}))
`;
    const result = python(["-c", code, SCRIPT, scratch]);
    expect(result.stderr).not.toContain("Traceback");
    const read = JSON.parse(result.stdout) as { ok: string[]; changed: string[]; frames: Record<string, string> };
    expect(read.ok).toEqual([]); // 48 kbit/s CBR mono 24 kHz and every field
    expect(read.changed).toHaveLength(1);
    expect(read.frames).toMatchObject({
      TLAN: "fra",
      TCOP: "CC BY-SA 4.0",
      TDRC: "2026-11-12",
      "TXXX:lernapps-synthetic": "true",
      "TXXX:lernapps-digital-source-type": "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
      "TXXX:lernapps-model": "piper fr_FR-upmc-medium",
      "TXXX:lernapps-voice": "pierre",
      "TXXX:lernapps-attribution": "UPMC Pierre voice data, CC BY-SA 4.0",
      "TXXX:lernapps-text": "Où est l'école? Là-bas, à côté de la gare.",
    });
    expect(read.frames["TXXX:lernapps-generator"]).toMatch(/^lernapps_audio\.py \d+\.\d+\.\d+$/);
  });
});
