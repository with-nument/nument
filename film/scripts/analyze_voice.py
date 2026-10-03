#!/usr/bin/env python3
"""Measures voice takes so voices can be matched without listening.

Usage: python3 scripts/analyze_voice.py <wav> [<wav> ...]
Prints median pitch, pitch range (semitones), brightness (spectral centroid),
speech duration and leading/trailing silence for each file.
"""
import json
import subprocess
import sys

import numpy as np

SR = 22050


def load(path):
    raw = subprocess.run(
        ['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, '<f4').astype(float)


def pitch_track(x, frame=1024, hop=256):
    out = []
    for i in range(0, len(x) - frame, hop):
        s = x[i:i + frame] * np.hanning(frame)
        if np.sqrt(np.mean(s ** 2)) < 0.01:
            continue
        ac = np.fft.irfft(np.abs(np.fft.rfft(s, 2 * frame)) ** 2)[:frame]
        lo, hi = int(SR / 420), int(SR / 110)
        lag = lo + np.argmax(ac[lo:hi])
        if ac[lag] / ac[0] > 0.45:
            out.append(SR / lag)
    return np.array(out)


def measure(path):
    x = load(path)
    env = np.convolve(np.abs(x), np.ones(441) / 441, 'same')
    voiced = np.where(env > 0.015)[0]
    start, end = (voiced[0] / SR, voiced[-1] / SR) if len(voiced) else (0, 0)
    f = pitch_track(x)
    spec = np.abs(np.fft.rfft(x)) ** 2
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    return {
        'file': path.split('/')[-1],
        'pitch_hz': round(float(np.median(f)), 1) if len(f) else None,
        'range_st': round(float(12 * np.log2(np.percentile(f, 90) / np.percentile(f, 10))), 1) if len(f) else None,
        'bright_hz': round(float((spec * freqs).sum() / spec.sum())),
        'speech_s': round(end - start, 2),
        'lead_s': round(start, 2),
        'tail_s': round(len(x) / SR - end, 2),
        'peak': round(float(np.abs(x).max()), 3),
    }


if __name__ == '__main__':
    rows = [measure(p) for p in sys.argv[1:]]
    for r in rows:
        print(json.dumps(r))
