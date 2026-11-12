#!/usr/bin/env python3
"""Synthetic speech (MP3) for lernapps.net language apps.

    lernapps_audio.py preflight [--install] [--json]
    lernapps_audio.py generate --lang fr --voice ff_siwis --text "Bonjour." --out src/audio/bonjour.mp3
    lernapps_audio.py generate --batch sentences.json [--lang L --voice V --accent us|gb --speed 1.0]
    lernapps_audio.py voices [--lang L] [--json]

Only the voices of VOICES are allowed (the owner chose them by listening). Engines: Kokoro (kokoro-onnx) and Piper
(piper-tts, for the voice "pierre" only). This file needs the standard library only; the engines live in a venv in the
user's cache directory (~/.cache/lernapps/audio, or $XDG_CACHE_HOME/lernapps/audio; $LERNAPPS_AUDIO_HOME overrides
both; $LERNAPPS_AUDIO_OFFLINE=1 skips the host probes), never in the app. The app's build reads the ID3 fields
written here: keep FIELDS in line with it.

Exit codes: 0 ok, 2 a prerequisite is missing, 3 voice not allowed, 4 generation failed, 64 wrong usage.
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

VERSION = "1.0.0"
GENERATOR = f"lernapps_audio.py {VERSION}"
EXIT_OK, EXIT_PREREQUISITE, EXIT_VOICE, EXIT_FAILED, EXIT_USAGE = 0, 2, 3, 4, 64

LICENCE = "CC BY-SA 4.0"  # of the files: all content of the apps
DIGITAL_SOURCE_TYPE = "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"
MP3_BITRATE, MP3_RATE = 48_000, 24_000  # CBR bit/s, Hz; always mono
MIN_PYTHON = (3, 10)
PACKAGES = ["kokoro-onnx==0.6.1", "soundfile==0.14.0", "piper-tts==1.8.0"]
FFMPEG_PACKAGE = "imageio-ffmpeg==0.6.0"  # fallback when no system ffmpeg
IMPORTS = "import kokoro_onnx, soundfile, piper"
PIPER_SPEAKER_ID = 1  # in fr_FR-upmc-medium: jessica is 0 (not allowed), pierre is 1
SIWIS = "SIWIS corpus, CC BY 4.0, University of Edinburgh"
PIERRE = "UPMC Pierre voice data, CC BY-SA 4.0"

# Language -> ISO 639-2 for TLAN; Kokoro language code per (language, accent).
ISO_639_2 = {"en": "eng", "fr": "fra", "es": "spa", "it": "ita"}
KOKORO_LANG = {("en", "us"): "en-us", ("en", "gb"): "en-gb", ("fr", ""): "fr-fr", ("es", ""): "es", ("it", ""): "it"}

# The allowed voices: name -> (language, accent, gender, engine, attribution). Keep references/voices.md in line.
VOICES: dict[str, tuple[str, str, str, str, str]] = {
    **{v: ("en", "us", "f", "kokoro", "none") for v in ("af_sarah", "af_nova", "af_sky")},
    **{v: ("en", "us", "m", "kokoro", "none") for v in ("am_eric", "am_puck")},
    **{v: ("en", "gb", "f", "kokoro", "none") for v in ("bf_emma", "bf_isabella", "bf_lily")},
    **{v: ("en", "gb", "m", "kokoro", "none") for v in ("bm_george", "bm_daniel")},
    "ff_siwis": ("fr", "", "f", "kokoro", SIWIS),
    "pierre": ("fr", "", "m", "piper", PIERRE),
    "ef_dora": ("es", "", "f", "kokoro", "none"),
    "em_alex": ("es", "", "m", "kokoro", "none"),
    "if_sara": ("it", "", "f", "kokoro", "none"),
    "im_nicola": ("it", "", "m", "kokoro", "none"),
}
MODEL_NAME = {"kokoro": "kokoro-v1.0", "piper": "piper fr_FR-upmc-medium"}
MODEL_LICENCE = {"kokoro": "Apache-2.0", "piper": "dataset CC BY-SA 4.0"}

# Model files: name -> (url, bytes, sha256). Needed per engine below.
_KOKORO_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
_PIPER_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/upmc/medium/"
MODELS = {
    "kokoro-v1.0.onnx": (
        _KOKORO_URL + "kokoro-v1.0.onnx",
        325_532_387,
        "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5",
    ),
    "voices-v1.0.bin": (
        _KOKORO_URL + "voices-v1.0.bin",
        28_214_398,
        "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
    ),
    "fr_FR-upmc-medium.onnx": (
        _PIPER_URL + "fr_FR-upmc-medium.onnx",
        76_733_615,
        "9abb3800c199148897a9ed64e100d224f3de83579f100044174ad19418f1786f",
    ),
    "fr_FR-upmc-medium.onnx.json": (
        _PIPER_URL + "fr_FR-upmc-medium.onnx.json",
        4_996,
        "e8636ec15dfd5d72db37a02cb5320a20f2b8d339f2a0e4337da64c58a33a5868",
    ),
}
ENGINE_MODELS = {
    "kokoro": ["kokoro-v1.0.onnx", "voices-v1.0.bin"],
    "piper": ["fr_FR-upmc-medium.onnx", "fr_FR-upmc-medium.onnx.json"],
}
PACKAGE_HOSTS = ["pypi.org", "files.pythonhosted.org"]
PACKAGE_PROBES = ["https://pypi.org/simple/pip/", "https://files.pythonhosted.org/"]
MB = 1_000_000


def mb(size: int) -> str:
    return f"{size // MB} MB" if size >= MB else f"{max(size // 1000, 1)} kB"

# ID3 field of each ffmpeg metadata key. The contract with the app's build (it aborts when one is missing).
FIELDS = {
    "language": "TLAN",
    "copyright": "TCOP",
    "date": "TDRC",
    **{
        key: f"TXXX:{key}"
        for key in (
            "lernapps-synthetic",
            "lernapps-digital-source-type",
            "lernapps-model",
            "lernapps-voice",
            "lernapps-generator",
            "lernapps-attribution",
            "lernapps-text",
        )
    },
}


class Problem(Exception):
    """An expected problem: shown as one line, never as a traceback."""

    def __init__(self, message: str, code: int):
        super().__init__(message)
        self.code = code


# --------------------------------------------------------------------------------------------------------------------
# Places

def home() -> Path:
    if os.environ.get("LERNAPPS_AUDIO_HOME"):
        return Path(os.environ["LERNAPPS_AUDIO_HOME"])
    base = os.environ.get("XDG_CACHE_HOME") or str(Path.home() / ".cache")
    return Path(base) / "lernapps" / "audio"


def venv_python() -> Path:
    venv = home() / "venv"
    return venv / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def model_path(name: str) -> Path:
    return home() / "models" / name


# --------------------------------------------------------------------------------------------------------------------
# Voices

def resolve_voice(voice: str, lang: str | None, accent: str | None) -> tuple[str, str, str]:
    """Check a voice against the list; return (language, accent, kokoro language code). Raises Problem(3)."""
    if voice not in VOICES:
        allowed = ", ".join(sorted(VOICES))
        raise Problem(f"voice '{voice}' is not allowed. Allowed voices: {allowed}. Run: {Path(__file__).name} voices", EXIT_VOICE)
    v_lang, v_accent, *_ = VOICES[voice]
    if lang is None:
        raise Problem(f"give --lang ({', '.join(ISO_639_2)}) or put it in the batch file", EXIT_USAGE)
    if v_lang != lang:
        raise Problem(f"voice '{voice}' speaks {v_lang}, not {lang}. Voices for {lang}: {', '.join(voices_for(lang))}", EXIT_VOICE)
    if accent and v_accent != accent:
        raise Problem(f"voice '{voice}' is for the accent '{v_accent}', not '{accent}'. Voices for it: {', '.join(voices_for(lang, accent))}", EXIT_VOICE)
    return v_lang, v_accent, KOKORO_LANG[(v_lang, v_accent)]


def voices_for(lang: str, accent: str = "") -> list[str]:
    return [n for n, v in VOICES.items() if v[0] == lang and (not accent or v[1] == accent)]


def voice_rows(lang: str | None = None) -> list[dict]:
    return [
        {"voice": n, "lang": v[0], "accent": v[1], "gender": v[2], "engine": v[3], "model": MODEL_NAME[v[3]],
         "licence": MODEL_LICENCE[v[3]], "attribution": v[4]}
        for n, v in VOICES.items() if lang in (None, v[0])
    ]  # fmt: skip


# --------------------------------------------------------------------------------------------------------------------
# Metadata: ffmpeg writes the tags, read_id3 reads them back (ffprobe cannot show TXXX frames with hyphens)

def build_tags(voice: str, text: str, today: str | None = None) -> dict[str, str]:
    lang, _, _, engine, attribution = VOICES[voice]
    return {
        "language": ISO_639_2[lang],
        "copyright": LICENCE,
        "date": today or datetime.date.today().isoformat(),
        "lernapps-synthetic": "true",
        "lernapps-digital-source-type": DIGITAL_SOURCE_TYPE,
        "lernapps-model": MODEL_NAME[engine],
        "lernapps-voice": voice,
        "lernapps-generator": GENERATOR,
        "lernapps-attribution": attribution,
        "lernapps-text": text,
    }


def _text(raw: bytes) -> str:
    """Decode the text of an ID3v2 text frame body (first byte: encoding)."""
    enc = {0: "latin-1", 1: "utf-16", 2: "utf-16-be", 3: "utf-8"}.get(raw[0], "utf-8")
    return raw[1:].decode(enc, errors="replace")


def _syncsafe(b: bytes) -> int:
    return (b[0] << 21) | (b[1] << 14) | (b[2] << 7) | b[3]


def read_id3(path: Path | str) -> tuple[dict[str, str], int]:
    """Read the ID3v2.3/2.4 text frames of a file: ({"TLAN": "fra", "TXXX:lernapps-voice": "ff_siwis", ...}, tag size)."""
    with open(path, "rb") as f:
        head = f.read(10)
        if head[:3] != b"ID3" or head[3] not in (3, 4):
            return {}, 0
        size = _syncsafe(head[6:10])
        body = f.read(size)
    frames: dict[str, str] = {}
    pos = 0
    while pos + 10 <= len(body) and body[pos] != 0:  # zero = padding
        fid = body[pos : pos + 4].decode("latin-1")
        n = _syncsafe(body[pos + 4 : pos + 8]) if head[3] == 4 else struct.unpack(">I", body[pos + 4 : pos + 8])[0]
        data = body[pos + 10 : pos + 10 + n]
        pos += 10 + n
        if not data or not fid.startswith("T"):
            continue
        if fid == "TXXX":
            enc = data[0]
            wide = enc in (1, 2)
            sep = b"\x00\x00" if wide else b"\x00"
            cut = data.find(sep, 1)
            while wide and cut != -1 and (cut - 1) % 2:  # find a separator on a 2-byte boundary
                cut = data.find(sep, cut + 1)
            if cut == -1:
                continue
            frames[f"TXXX:{_text(data[:1] + data[1:cut])}"] = _text(data[:1] + data[cut + len(sep) :]).rstrip("\x00")
        else:
            frames[fid] = _text(data).rstrip("\x00")
    return frames, 10 + size


_MPEG2_L3_KBPS = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
_MPEG2_RATES = [22050, 24000, 16000]


def _frame(data: bytes, i: int) -> dict:
    """Decode the 4-byte MPEG audio frame header at data[i]."""
    h = data[i : i + 4]
    version, layer = (h[1] >> 3) & 3, (h[1] >> 1) & 3  # version 2 = MPEG 2; layer 1 = III
    rate_i, kbps_i = (h[2] >> 2) & 3, h[2] >> 4
    if version != 2 or layer != 1 or rate_i == 3 or kbps_i in (0, 15):
        return {"layer3": False}
    kbps, rate = _MPEG2_L3_KBPS[kbps_i], _MPEG2_RATES[rate_i]
    return {"layer3": True, "kbps": kbps, "rate": rate, "channels": 1 if h[3] >> 6 == 3 else 2,
            "length": 72 * kbps * 1000 // rate + ((h[2] >> 1) & 1)}  # fmt: skip


def read_mpeg(path: Path | str, tag_size: int) -> dict:
    """The first MPEG audio frame after the ID3 tag (not the Xing/Info frame, which has a bit rate of its own)."""
    with open(path, "rb") as f:
        f.seek(tag_size)
        data = f.read(8192)
    i = next((k for k in range(len(data) - 3) if data[k] == 0xFF and data[k + 1] & 0xE0 == 0xE0), -1)
    if i < 0:
        return {}
    frame = _frame(data, i)
    if frame.get("layer3") and (b"Info" in data[i : i + 60] or b"Xing" in data[i : i + 60]):
        frame = _frame(data, i + frame["length"]) if data[i + frame["length"]] == 0xFF else {}
    return {k: v for k, v in frame.items() if k != "length"}


def verify_mp3(path: Path | str, tags: dict[str, str]) -> list[str]:
    """Everything that is wrong with the file: a field missing or different, or the audio not 48 kbit/s mono 24 kHz."""
    frames, tag_size = read_id3(path)
    wrong = []
    for key, frame in FIELDS.items():
        if frame not in frames:
            wrong.append(f"{frame} ({key}) is missing")
        elif frames[frame] != tags[key]:
            wrong.append(f"{frame} ({key}) reads '{frames[frame][:40]}', expected '{tags[key][:40]}'")
    audio = read_mpeg(path, tag_size)
    if audio != {"layer3": True, "kbps": MP3_BITRATE // 1000, "rate": MP3_RATE, "channels": 1}:
        wrong.append(f"audio is {audio or 'not MPEG'}, expected MP3 {MP3_BITRATE // 1000} kbit/s, {MP3_RATE} Hz, mono")
    return wrong


def encode_mp3(ffmpeg: str, wav: Path, out: Path, tags: dict[str, str]) -> None:
    """WAV -> MP3 (mono, 24 kHz, 48 kbit/s CBR) with the tags as ID3v2.4. Writes via a temporary file next to `out`."""
    tmp = out.with_name(out.name + ".part")
    cmd = [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav), "-map_metadata", "-1",
           "-codec:a", "libmp3lame", "-b:a", "48k", "-ac", "1", "-ar", str(MP3_RATE), "-id3v2_version", "4"]  # fmt: skip
    for key, value in tags.items():
        cmd += ["-metadata", f"{key}={value}"]
    done = subprocess.run([*cmd, "-f", "mp3", str(tmp)], capture_output=True, text=True)
    if done.returncode != 0:
        tmp.unlink(missing_ok=True)
        raise Problem(f"ffmpeg failed: {done.stderr.strip()[-300:]}", EXIT_FAILED)
    tmp.replace(out)


# --------------------------------------------------------------------------------------------------------------------
# Prerequisites. Each check returns a list of (id, detail, what is missing, what to do); empty when fine.

Check = tuple[str, str, str | None]  # (id, ok detail, problem text "what — what to do" or None)


def run_py(code: str, timeout: int = 180) -> subprocess.CompletedProcess:
    return subprocess.run([str(venv_python()), "-c", code], capture_output=True, text=True, timeout=timeout)


def check_python() -> Check:
    have = ".".join(map(str, sys.version_info[:3]))
    if sys.version_info < MIN_PYTHON:
        return "python", have, f"Python {have} is too old — install Python {MIN_PYTHON[0]}.{MIN_PYTHON[1]} or newer and run this script with it"
    try:
        import ensurepip, venv  # noqa: F401, E401
    except ImportError:
        return "python", have, "Python's venv module is missing — install it (Debian/Ubuntu: apt install python3-venv) and run again"
    return "python", have, None


def check_packages() -> Check:
    if not venv_python().exists():
        return "packages", "", f"the Python environment {home() / 'venv'} does not exist — run: {Path(__file__).name} preflight --install"
    try:
        done = run_py(IMPORTS)
    except (subprocess.TimeoutExpired, OSError):
        done = None
    if done is None or done.returncode != 0:
        return "packages", "", f"the packages kokoro-onnx, soundfile or piper-tts are not importable in {home() / 'venv'} — run: {Path(__file__).name} preflight --install"
    return "packages", "kokoro-onnx, soundfile, piper-tts", None


def find_ffmpeg() -> str | None:
    """A working ffmpeg with the MP3 encoder: the system one, else imageio-ffmpeg from the venv."""
    candidates = [shutil.which("ffmpeg")]
    if venv_python().exists():
        try:
            done = run_py("import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())", 60)
            candidates.append(done.stdout.strip() if done.returncode == 0 else None)
        except (subprocess.TimeoutExpired, OSError):
            pass
    for exe in filter(None, candidates):
        try:
            done = subprocess.run([exe, "-hide_banner", "-encoders"], capture_output=True, text=True, timeout=30)
        except (subprocess.TimeoutExpired, OSError):
            continue
        if "libmp3lame" in done.stdout:
            return exe
    return None


def check_ffmpeg() -> Check:
    exe = find_ffmpeg()
    if exe:
        return "ffmpeg", exe, None
    return "ffmpeg", "", "ffmpeg with the MP3 encoder is missing — install it (apt install ffmpeg, brew install ffmpeg) or run: " + f"{Path(__file__).name} preflight --install (installs imageio-ffmpeg, 65 MB)"


def check_models(engines: list[str]) -> list[Check]:
    checks = []
    for name in sorted({n for e in engines for n in ENGINE_MODELS[e]}):
        _, size, _ = MODELS[name]
        path = model_path(name)
        have = path.stat().st_size if path.exists() else None
        if have == size:
            checks.append((f"model {name}", mb(size), None))
        else:
            what = "is missing" if have is None else f"has {have} bytes instead of {size}"
            checks.append((f"model {name}", "", f"model file {path} {what} — run: {Path(__file__).name} preflight --install ({mb(size)} from {urlparse(MODELS[name][0]).hostname})"))
    return checks


def check_disk(need: int) -> Check:
    probe = home()
    while not probe.exists():
        probe = probe.parent
    free = shutil.disk_usage(probe).free
    if free < need:
        return "disk", "", f"only {free // MB} MB free in {probe}, about {need // MB} MB needed — free some space or set XDG_CACHE_HOME to a larger disk"
    return "disk", f"{free // MB} MB free", None


def probe(url: str) -> tuple[bool, str]:
    """GET the first byte, following redirects by hand. Returns (reachable, host that answered or that failed)."""
    class Stop(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):  # noqa: ARG002
            return None

    opener = urllib.request.build_opener(Stop)
    host = urlparse(url).hostname or url
    for _ in range(6):
        req = urllib.request.Request(url, headers={"Range": "bytes=0-0", "User-Agent": GENERATOR})
        try:
            with opener.open(req, timeout=15) as response:
                return True, host
        except urllib.error.HTTPError as error:
            location = error.headers.get("Location")
            if error.code in (301, 302, 303, 307, 308) and location:
                url = urllib.request.urljoin(url, location)
                host = urlparse(url).hostname or host
                continue
            return error.code != 407, host  # any answer of the server means the host is reachable
        except (urllib.error.URLError, OSError):
            return False, host
    return False, host


def check_hosts(need_packages: bool, need_models: list[str]) -> list[Check]:
    probes: list[tuple[str, str]] = [(u, urlparse(u).hostname or u) for u in PACKAGE_PROBES] if need_packages else []
    probes += [(MODELS[n][0], urlparse(MODELS[n][0]).hostname or "") for n in need_models if n.endswith((".onnx", ".bin"))]
    checks, seen = [], set()
    for url, host in probes:
        if host in seen:
            continue
        seen.add(host)
        ok, reached = probe(url)
        label = f"host {host}" + (f" (via {reached})" if reached != host and ok else "")
        if ok:
            checks.append((label, "reachable", None))
        else:
            checks.append((f"host {reached}", "", f"{reached} is not reachable (needed for {host}) — the environment must allow {reached}; ask whoever manages the network or the sandbox"))
    return checks


def preflight(engines: list[str], network: bool = True) -> list[Check]:
    """All checks at once; the first line items are the facts, the problems carry the advice."""
    checks = [check_python(), check_packages(), check_ffmpeg()]
    models = check_models(engines)
    checks += models
    missing_models = [c[0].removeprefix("model ") for c in models if c[2]]
    packages_missing = checks[1][2] is not None
    ffmpeg_missing = checks[2][2] is not None
    need = (450 * MB if packages_missing else 0) + (200 * MB if ffmpeg_missing else 0) + sum(MODELS[n][1] for n in missing_models)
    checks.append(check_disk(need + (100 * MB if need else 0)))
    network = network and not os.environ.get("LERNAPPS_AUDIO_OFFLINE")  # tests: no host probes
    if network and (packages_missing or ffmpeg_missing or missing_models):
        checks += check_hosts(packages_missing or ffmpeg_missing, missing_models)
    elif network:
        checks.append(("hosts", "not needed, everything is installed", None))
    return checks


def report(checks: list[Check], as_json: bool) -> int:
    problems = [c for c in checks if c[2]]
    if as_json:
        print(json.dumps({
            "ok": not problems,
            "generator": GENERATOR,
            "cache": str(home()),
            "checks": [{"id": i, "ok": p is None, "detail": d or None} for i, d, p in checks],
            "problems": [{"id": i, "message": p} for i, _, p in problems],
        }, indent=2, ensure_ascii=False))  # fmt: skip
    else:
        for i, detail, p in checks:
            if p is None:
                print(f"ok: {i}" + (f" ({detail})" if detail else ""))
        for _, _, p in problems:
            print(f"missing: {p}")
        print("All prerequisites are met." if not problems else f"{len(problems)} problem(s). Fix them, then run preflight again.")
    return EXIT_PREREQUISITE if problems else EXIT_OK


# --------------------------------------------------------------------------------------------------------------------
# Install: venv, packages, models. Only into the cache directory.

def say(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


def pip_install(*packages: str) -> None:
    say(f"Installing {', '.join(packages)} into {home() / 'venv'} ...")
    done = subprocess.run([str(venv_python()), "-m", "pip", "install", "--disable-pip-version-check", "-q", *packages], capture_output=True, text=True)
    if done.returncode != 0:
        raise Problem(f"pip could not install {', '.join(packages)} — check that pypi.org and files.pythonhosted.org are reachable. pip said: {done.stderr.strip()[-300:]}", EXIT_PREREQUISITE)


def download(name: str) -> None:
    url, size, digest = MODELS[name]
    target = model_path(name)
    target.parent.mkdir(parents=True, exist_ok=True)
    part = target.with_name(target.name + ".part")
    say(f"Downloading {name} ({mb(size)}) from {urlparse(url).hostname} ...")
    sha, got, shown = hashlib.sha256(), 0, 0
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": GENERATOR}), timeout=60) as response, open(part, "wb") as out:
            while chunk := response.read(1 << 20):
                out.write(chunk)
                sha.update(chunk)
                got += len(chunk)
                if got * 10 // size > shown:
                    shown = got * 10 // size
                    say(f"  {shown * 10} %")
    except (urllib.error.URLError, OSError) as error:
        part.unlink(missing_ok=True)
        raise Problem(f"could not download {name}: {error}. The environment must allow {urlparse(url).hostname} and its download CDN", EXIT_PREREQUISITE) from error
    if got != size or sha.hexdigest() != digest:
        part.unlink(missing_ok=True)
        raise Problem(f"{name} arrived damaged ({got} bytes, expected {size}, or the checksum differs) — run again", EXIT_PREREQUISITE)
    part.replace(target)


def install(checks: list[Check]) -> None:
    """Fix what preflight found and can fix. The caller runs preflight again."""
    open_ids = {i for i, _, p in checks if p}
    blocked = [p for i, _, p in checks if p and (i in ("python", "disk") or i.startswith("host "))]
    if blocked:
        raise Problem("cannot install yet:\n" + "\n".join(f"missing: {p}" for p in blocked), EXIT_PREREQUISITE)
    if "packages" in open_ids:
        if not venv_python().exists():
            say(f"Creating the Python environment {home() / 'venv'} ...")
            home().mkdir(parents=True, exist_ok=True)
            done = subprocess.run([sys.executable, "-m", "venv", str(home() / "venv")], capture_output=True, text=True)
            if done.returncode != 0:
                raise Problem(f"could not create the venv: {done.stderr.strip()[-300:]}", EXIT_PREREQUISITE)
        pip_install(*PACKAGES)
    if "ffmpeg" in open_ids and not shutil.which("ffmpeg"):
        if not venv_python().exists():
            raise Problem("no venv for imageio-ffmpeg; run preflight --install again", EXIT_PREREQUISITE)
        pip_install(FFMPEG_PACKAGE)
    for i in sorted(open_ids):
        if i.startswith("model "):
            download(i.removeprefix("model "))


def ensure_ready(engines: list[str], do_install: bool, network: bool = True) -> None:
    checks = preflight(engines, network)
    if do_install and any(c[2] for c in checks):
        install(checks)
        checks = preflight(engines, network=False)
    problems = [c[2] for c in checks if c[2]]
    if problems:
        raise Problem("\n".join(f"missing: {p}" for p in problems) + "\nRun preflight to see everything at once.", EXIT_PREREQUISITE)


# --------------------------------------------------------------------------------------------------------------------
# Synthesis (runs inside the venv)

def synthesize(voice: str, lang_code: str, text: str, speed: float, wav: Path, cache: dict) -> None:
    engine = VOICES[voice][3]
    if engine == "kokoro":
        import soundfile
        from kokoro_onnx import Kokoro

        kokoro = cache.setdefault("kokoro", Kokoro(str(model_path("kokoro-v1.0.onnx")), str(model_path("voices-v1.0.bin"))))
        samples, rate = kokoro.create(text, voice=voice, speed=speed, lang=lang_code)
        soundfile.write(str(wav), samples, rate)
    else:
        import wave

        from piper import PiperVoice, SynthesisConfig

        piper = cache.setdefault("piper", PiperVoice.load(str(model_path("fr_FR-upmc-medium.onnx"))))
        with wave.open(str(wav), "wb") as out:
            piper.synthesize_wav(text, out, syn_config=SynthesisConfig(speaker_id=PIPER_SPEAKER_ID, length_scale=1 / speed))


def make_one(item: dict, ffmpeg: str, cache: dict) -> str:
    """Generate, tag and verify one file. Raises Problem(4) or Problem(3); returns a line for the user."""
    voice, text, out = item["voice"], item["text"], Path(item["out"])
    lang, accent, lang_code = resolve_voice(voice, item["lang"], item.get("accent"))
    if out.exists() and not item["force"]:
        raise Problem(f"{out} exists — choose another name, or add --force to replace it", EXIT_FAILED)
    out.parent.mkdir(parents=True, exist_ok=True)
    tags = build_tags(voice, text)
    with tempfile.TemporaryDirectory(prefix="lernapps-audio-") as tmp:
        wav = Path(tmp) / "speech.wav"
        try:
            synthesize(voice, lang_code, text, item["speed"], wav, cache)
        except Exception as error:  # the engines raise many kinds; none is a bug of this script's user
            raise Problem(f"{out}: the voice engine failed: {type(error).__name__}: {error}", EXIT_FAILED) from error
        encode_mp3(ffmpeg, wav, out, tags)
    wrong = verify_mp3(out, tags)
    if wrong:
        out.unlink(missing_ok=True)
        raise Problem(f"{out}: the file was removed because the check failed: " + "; ".join(wrong), EXIT_FAILED)
    return f"ok: {out} ({out.stat().st_size * 8 / MP3_BITRATE:.1f} s, {out.stat().st_size // 1000} kB, {voice}, {lang})"


# --------------------------------------------------------------------------------------------------------------------
# Commands

def load_items(args: argparse.Namespace) -> list[dict]:
    """The items to generate, each with every setting: from --text/--out, or from the --batch file."""
    defaults = {"lang": args.lang, "voice": args.voice, "accent": args.accent, "speed": args.speed}
    if args.batch:
        try:
            data = json.loads(Path(args.batch).read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            raise Problem(f"cannot read the batch file {args.batch}: {error}", EXIT_USAGE) from error
        if isinstance(data, dict):
            defaults |= {k: v for k, v in data.items() if k in defaults}
            data = data.get("items")
        raw = data if isinstance(data, list) else None
        if not raw:
            raise Problem('the batch file must be a list of {"text", "out"} items, or {"lang", "voice", "items": [...]}', EXIT_USAGE)
    elif args.text and args.out:
        raw = [{"text": args.text, "out": args.out}]
    else:
        raise Problem("give --text and --out, or --batch file.json", EXIT_USAGE)
    items = []
    for n, entry in enumerate(raw, 1):
        item = {**defaults, **entry, "force": args.force}
        text, out = str(item.get("text", "")).strip(), str(item.get("out", ""))
        if not text or not out or not item.get("voice"):
            raise Problem(f"item {n}: needs text, out and a voice (--voice or in the file)", EXIT_USAGE)
        if not re.fullmatch(r"[a-z0-9][a-z0-9_.-]*\.mp3", Path(out).name):
            raise Problem(f"item {n}: the file name of '{out}' must be lowercase and end in .mp3 (the build accepts nothing else)", EXIT_USAGE)
        if not 0.5 <= float(item["speed"]) <= 2.0:
            raise Problem(f"item {n}: --speed must be between 0.5 and 2.0", EXIT_USAGE)
        items.append({**item, "text": text, "speed": float(item["speed"])})
    for item in items:  # all voices first: nothing is generated when one is wrong
        resolve_voice(item["voice"], item["lang"], item.get("accent"))
    return items


def cmd_generate(args: argparse.Namespace) -> int:
    items = load_items(args)
    inside = os.environ.get("LERNAPPS_AUDIO_IN_VENV") == "1"
    if not inside:
        engines = sorted({VOICES[i["voice"]][3] for i in items})
        ensure_ready(engines, args.install)
        env = {**os.environ, "LERNAPPS_AUDIO_IN_VENV": "1"}
        return subprocess.call([str(venv_python()), str(Path(__file__).resolve()), *sys.argv[1:]], env=env)
    ffmpeg = find_ffmpeg()
    if not ffmpeg:
        raise Problem("ffmpeg with the MP3 encoder is missing — run preflight", EXIT_PREREQUISITE)
    cache: dict = {}
    failed = 0
    for item in items:
        try:
            print(make_one(item, ffmpeg, cache), flush=True)
        except Problem as problem:
            if problem.code != EXIT_FAILED:
                raise
            failed += 1
            print(f"failed: {problem}", flush=True)
    if failed:
        print(f"{failed} of {len(items)} file(s) failed.", flush=True)
    return EXIT_FAILED if failed else EXIT_OK


def cmd_preflight(args: argparse.Namespace) -> int:
    engines = ["kokoro", "piper"]
    if args.install:
        try:
            checks = preflight(engines)
            if any(c[2] for c in checks):
                install(checks)
                checks = preflight(engines, network=False)
        except Problem as problem:
            print(problem)
            return problem.code
    else:
        checks = preflight(engines)
    return report(checks, args.json)


def cmd_voices(args: argparse.Namespace) -> int:
    rows = voice_rows(args.lang)
    if args.json:
        print(json.dumps(rows, indent=2, ensure_ascii=False))
        return EXIT_OK
    for r in rows:
        accent = f"/{r['accent']}" if r["accent"] else ""
        print(f"{r['voice']:<12} {r['lang']}{accent:<4} {r['gender']}  {r['engine']:<7} {r['licence']:<22} attribution: {r['attribution']}")
    return EXIT_OK


class Parser(argparse.ArgumentParser):
    def error(self, message: str):  # argparse would exit with 2, which means "prerequisite missing" here
        self.print_usage(sys.stderr)
        print(f"error: {message}", file=sys.stderr)
        sys.exit(EXIT_USAGE)


def main(argv: list[str] | None = None) -> int:
    parser = Parser(description="Synthetic speech (MP3) for lernapps.net language apps.")
    sub = parser.add_subparsers(dest="command", required=True, parser_class=Parser)
    pre = sub.add_parser("preflight", help="check all prerequisites and print all problems at once")
    pre.add_argument("--install", action="store_true", help="install what is missing (venv, packages, models) into the cache")
    pre.add_argument("--json", action="store_true")
    gen = sub.add_parser("generate", help="speak a text into an MP3 file")
    gen.add_argument("--lang", choices=sorted(ISO_639_2))
    gen.add_argument("--voice")
    gen.add_argument("--accent", choices=["us", "gb"], help="English only; default: the accent of the voice, else us")
    gen.add_argument("--text")
    gen.add_argument("--out", help="e.g. src/audio/bonjour.mp3 (lowercase, .mp3)")
    gen.add_argument("--speed", type=float, default=1.0)
    gen.add_argument("--batch", help='JSON: a list of {"text","out"[,"voice","lang","speed"]} or {"lang","voice","items":[...]}')
    gen.add_argument("--force", action="store_true", help="replace an existing file")
    gen.add_argument("--install", action="store_true", help="install what is missing first")
    vo = sub.add_parser("voices", help="list the allowed voices")
    vo.add_argument("--lang", choices=sorted(ISO_639_2))
    vo.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)
    try:
        return {"preflight": cmd_preflight, "generate": cmd_generate, "voices": cmd_voices}[args.command](args)
    except Problem as problem:
        print(f"error: {problem}", file=sys.stderr)
        return problem.code
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())
