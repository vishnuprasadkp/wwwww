#!/usr/bin/env python3
"""
Makes the recordings Nyrro plays when someone presses the speaker button.

Every answer in lib/nyrro/nyrro-knowledge-base.json is read aloud with the open-source Kokoro voice "af_heart"
(offline, Apache-2.0) and saved as public/nyrro-audio/<hash>.m4a, where <hash> is the FNV-1a hash of the answer text
(the same hash components/copilot/Nivvi.tsx computes in the browser). Run again whenever the answers change:

  uv venv --python 3.12 .tts && uv pip install --python .tts/bin/python kokoro-onnx soundfile
  curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx
  curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
  NYRRO_TTS_MODEL=/path/to/folder .tts/bin/python scripts/nyrro-audio.py   [--only 5]

Needs macOS `afconvert` for the AAC step. Answers that already have a file are skipped.
"""
import json, os, re, subprocess, sys, tempfile
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "nyrro-audio")
MODEL = os.environ.get("NYRRO_TTS_MODEL", ROOT)
VOICE, SPEED = "af_heart", 0.97

def fnv1a(text: str) -> str:
    h = 0x811C9DC5
    for b in text.encode("utf-8"):
        h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

# What the voice should say for things that are awkward to read aloud.
SPOKEN = [
    (r"vishnuprasadkp98@gmail\.com", "vishnu prasad K P nine eight, at gmail dot com"),
    (r"\bICD\b", "I C D"), (r"\bHDFC\b", "H D F C"), (r"\bDPDP\b", "D P D P"), (r"\bCGB\b", "C G B"),
    (r"\bDGE\b", "D G E"), (r"\bWCAG\b", "W C A G"), (r"\bUX\b", "U X"), (r"\bUI\b", "U I"), (r"\bSLA\b", "S L A"),
    (r"\bRFP\b", "R F P"), (r"\bCLM\b", "C L M"), (r"\bSAP\b", "S A P"), (r"\bIDP\b", "I D P"), (r"\bPII\b", "P I I"),
    (r"\bRAG\b", "R A G"), (r"\bLLMs?\b", "L L M"), (r"\bAPI\b", "A P I"), (r"\bKPIs?\b", "K P I"), (r"\bNFT\b", "N F T"),
    (r"\bSRE\b", "S R E"), (r"\bBOM\b", "B O M"), (r"\bCRM\b", "C R M"), (r"\bNDA\b", "N D A"), (r"\bROI\b", "R O I"),
    (r"\bFAQs?\b", "F A Q"), (r"\bMT103\b", "M T 103"), (r"\bUAE\b", "U A E"), (r"\bUS\b", "U S"), (r"\bIT\b", "I T"),
    (r"\bAI\b", "A I"), (r"\bADEO\b", "Adeo"), (r"\bNIT\b", "N I T"), (r"\bFigJam\b", "Fig Jam"),
    (r"\$(\d+(?:\.\d+)?)M\b", r"\1 million dollars"), (r"\$(\d+(?:\.\d+)?)K\b", r"\1 thousand dollars"),
    (r"(\d[\d,.]*)M\+", r"\1 million plus"), (r"(\d[\d,.]*)K\+", r"\1 thousand plus"), (r"(\d[\d,.]*)M\b", r"\1 million"),
    (r"(\d)\+", r"\1 plus"), (r"~", "about "), (r"→", " to "), (r"&", " and "), (r"\s[–—]\s", ", "), (r"(\d)–(\d)", r"\1 to \2"),
    (r"x(\d)", r"\1 times"),
]

def speakable(md: str) -> str:
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md)           # links: keep the label
    t = re.sub(r"[*_`]+", "", t)                                # bold / italic marks
    t = re.sub(r"[\U0001F300-\U0001FAFF☀-➿️]", "", t)  # emoji
    lines = []
    for raw in t.split("\n"):
        l = re.sub(r"^\s*(?:[-•]|\d+\.)\s+", "", raw).strip()
        if not l: continue
        lines.append(l if re.search(r"[.!?:]$", l) else l + ".")  # a pause after every bullet and heading
    t = " ".join(lines)
    for pat, rep in SPOKEN: t = re.sub(pat, rep, t)
    return re.sub(r"\s+", " ", t).strip()

def collect(kb):
    texts = [i["answer"] for i in kb["intents"]]
    for e in kb["entities"]:
        texts += list(e["answers"].values())
    for k in ("whichProjectAnswer", "repeatAnswer"):
        texts.append(kb[k])
    texts.append(kb["fallback"]["answer"] if isinstance(kb.get("fallback"), dict) else str(kb.get("fallback")))
    seen, out = set(), []
    for t in texts:
        if t and t not in seen: seen.add(t); out.append(t)
    return out

def main():
    only = int(sys.argv[sys.argv.index("--only") + 1]) if "--only" in sys.argv else None
    kb = json.load(open(os.path.join(ROOT, "lib/nyrro/nyrro-knowledge-base.json"), encoding="utf-8"))
    texts = collect(kb)[:only]
    os.makedirs(OUT, exist_ok=True)
    tts = Kokoro(os.path.join(MODEL, "kokoro-v1.0.int8.onnx"), os.path.join(MODEL, "voices-v1.0.bin"))
    done = 0
    for n, md in enumerate(texts, 1):
        dest = os.path.join(OUT, fnv1a(md) + ".m4a")
        if os.path.exists(dest): continue
        samples, rate = tts.create(speakable(md), voice=VOICE, speed=SPEED, lang="en-us")
        with tempfile.TemporaryDirectory() as tmp:
            wav = os.path.join(tmp, "a.wav")
            sf.write(wav, samples, rate)
            subprocess.run(["afconvert", wav, dest, "-f", "m4af", "-d", "aac", "-b", "40000", "-q", "127"], check=True)
        done += 1
        print(f"[{n}/{len(texts)}] {os.path.basename(dest)} {len(samples)/rate:.0f}s", flush=True)
    print(f"done: {done} new, {len(texts)} total")

if __name__ == "__main__":
    main()
