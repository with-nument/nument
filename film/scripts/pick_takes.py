#!/usr/bin/env python3
"""Picks one take per voiceover line without listening.

For every line it measures each take (speech length, pitch, pitch range, longest
internal pause, clipping) and keeps the take closest to the line's typical values,
so glitchy outliers (odd pauses, pitch jumps, rushed or dragged reads) lose.
Writes assets/vo/picks.json.
"""
import glob
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from analyze_voice import SR, load, pitch_track  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), '..')
TAKES = os.path.join(ROOT, 'assets/vo/takes')


def longest_gap(x):
    env = np.convolve(np.abs(x), np.ones(441) / 441, 'same') > 0.015
    idx = np.where(env)[0]
    if len(idx) < 2:
        return 0.0
    return float(np.max(np.diff(idx)) / SR)


def stats(path):
    x = load(path)
    f = pitch_track(x)
    words = json.load(open(path.replace('.wav', '.words.json')))['words']
    env = np.convolve(np.abs(x), np.ones(441) / 441, 'same')
    voiced = np.where(env > 0.015)[0]
    return {
        'take': os.path.basename(path)[:-4],
        'speech': (voiced[-1] - voiced[0]) / SR,
        'pitch': float(np.median(f)),
        'range': float(12 * np.log2(np.percentile(f, 90) / np.percentile(f, 10))),
        'gap': longest_gap(x),
        'peak': float(np.abs(x).max()),
        'words': len(words),
    }


def main():
    lines = json.load(open(os.path.join(ROOT, 'src/vo-lines.json')))['lines']
    all_stats = {}
    for line in lines:
        all_stats[line['id']] = [stats(p) for p in sorted(glob.glob(os.path.join(TAKES, f"{line['id']}-t*.wav")))]
    global_pitch = np.median([s['pitch'] for ss in all_stats.values() for s in ss])

    picks = {}
    for line in lines:
        ss = all_stats[line['id']]
        med = {k: np.median([s[k] for s in ss]) for k in ('speech', 'range')}

        def score(s):
            # distance from the line's typical read + pitch consistency with the whole voiceover
            d = abs(s['speech'] - med['speech']) / max(med['speech'], 0.3)
            d += abs(s['range'] - med['range']) / 12
            d += abs(12 * np.log2(s['pitch'] / global_pitch)) / 6
            d += max(0, s['gap'] - 0.55) * 3 if '…' not in line['text'] else 0
            d += 5 if s['peak'] > 0.99 else 0
            return d

        best = min(ss, key=score)
        picks[line['id']] = best['take']
        print(f"{line['id']:4} -> {best['take']:8} | " + '  '.join(
            f"{s['take'][-2:]}: {s['speech']:.2f}s {s['pitch']:.0f}Hz r{s['range']:.1f} gap{s['gap']:.2f} w{s['words']}" for s in ss))
    json.dump(picks, open(os.path.join(ROOT, 'assets/vo/picks.json'), 'w'), indent=1)
    print(f'voice median pitch {global_pitch:.0f} Hz')


if __name__ == '__main__':
    main()
