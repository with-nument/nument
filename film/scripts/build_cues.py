#!/usr/bin/env python3
"""Turns src/timeline.json + the picked takes into absolute voiceover cues.
`speechAt` in the timeline is when the speech itself starts (leading silence is compensated).

Writes src/generated/vo-cues.json (read by Remotion for word-synced type) and
assets/vo/vo-track.wav (the voiceover alone, placed on the 30 s timeline).
Fails loudly if two cues overlap or a cue runs past its section.
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000


def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<f4').astype(float)


def speech_bounds(x):
    env = np.convolve(np.abs(x), np.ones(480) / 480, 'same')
    idx = np.where(env > 0.015)[0]
    return idx[0] / SR, idx[-1] / SR


def main():
    tl = json.load(open(os.path.join(ROOT, 'src/timeline.json')))
    lines = {l['id']: l for l in json.load(open(os.path.join(ROOT, 'src/vo-lines.json')))['lines']}
    sections = tl['sections']
    track = np.zeros(int(tl['duration'] * SR))
    cues, problems = [], []

    for cue in tl['vo']:
        wav = os.path.join(ROOT, 'assets/vo/takes', cue['take'] + '.wav')
        words = json.load(open(wav.replace('.wav', '.words.json')))['words']
        x = load(wav)
        s0, s1 = speech_bounds(x)
        at = cue['speechAt'] - s0  # place the file so speech begins exactly at speechAt
        start, end = cue['speechAt'], at + s1
        section = next(s for s in sections if s['start'] <= start < s['end'])
        if end > section['end'] + 0.05:
            problems.append(f"{cue['line']} speech ends {end:.2f}s, after section {section['id']} ends {section['end']}s")
        if cues and start < cues[-1]['speechEnd'] + 0.08:
            problems.append(f"{cue['line']} starts {start:.2f}s, overlapping {cues[-1]['line']} (ends {cues[-1]['speechEnd']:.2f}s)")
        i = int(round(at * SR))
        track[i:i + len(x)] += x[: len(track) - i]
        cues.append({
            'line': cue['line'], 'take': cue['take'], 'section': section['id'], 'language': lines[cue['line']]['language'],
            'text': lines[cue['line']]['text'], 'at': round(at, 3), 'speechStart': round(start, 3), 'speechEnd': round(end, 3),
            'words': [{'word': w['word'], 'start': round(at + w['start'], 3), 'end': round(at + w['end'], 3)} for w in words],
        })

    os.makedirs(os.path.join(ROOT, 'src/generated'), exist_ok=True)
    json.dump({'cues': cues}, open(os.path.join(ROOT, 'src/generated/vo-cues.json'), 'w'), ensure_ascii=False, indent=1)
    track *= 10 ** (-1 / 20) / max(np.abs(track).max(), 1e-9)
    with wave.open(os.path.join(ROOT, 'assets/vo/vo-track.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((track * 32767).astype('<i2').tobytes())
    for c in cues:
        print(f"{c['line']:4} {c['section']}  {c['speechStart']:6.2f}–{c['speechEnd']:6.2f}s  {c['text']}")
    if problems:
        print('\nPROBLEMS:\n  ' + '\n  '.join(problems))
        sys.exit(1)
    print('\nno overlaps, every line inside its section')


if __name__ == '__main__':
    main()
