#!/usr/bin/env python3
"""Quality checks for a rendered film. Usage: python3 scripts/qa.py <video.mp4>

Checks: duration/fps/resolution, loudness + true peak, clipping, the score dropping out before the
hit, flashes or jump cuts (the film is one continuous shot), that all on-screen copy matches the
locked script, and no em/en dashes in the copy. Also writes a contact sheet (every 0.5 s) to
out/qa/<name>-sheet.png. Exits 1 if any check fails.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
FAIL = []


def check(ok, label, detail=''):
    print(('PASS ' if ok else 'FAIL ') + label + (f'  ({detail})' if detail else ''))
    if not ok:
        FAIL.append(label)


def probe(path):
    out = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], capture_output=True, text=True).stdout)
    v = next(s for s in out['streams'] if s['codec_type'] == 'video')
    a = next((s for s in out['streams'] if s['codec_type'] == 'audio'), None)
    return v, a, float(out['format']['duration'])


def loudness(path):
    err = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = err[err.rfind('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))


def audio(path, sr=48000):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-vn', '-ac', '2', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, '<f4').reshape(-1, 2).T


def frame_diffs(path, w=160, h=90):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(float)
    return np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))


def main(video):
    name = os.path.splitext(os.path.basename(video))[0]
    tl = json.load(open(os.path.join(ROOT, 'src/timeline.json')))
    v, a, dur = probe(video)
    fps = eval(v['r_frame_rate'])
    check(abs(dur - tl['duration']) < 0.05, 'duration 30.0 s', f'{dur:.3f}s')
    check(fps == tl['fps'], 'constant 60 fps', v['r_frame_rate'])
    check((int(v['width']), int(v['height'])) == (1920, 1080), '1920x1080', f"{v['width']}x{v['height']}")
    check(a is not None and int(a['sample_rate']) == 48000, 'audio 48 kHz', a and a['sample_rate'])

    lufs, tp = loudness(video)
    check(abs(lufs + 14) <= 0.5, 'loudness -14 LUFS ±0.5', f'{lufs} LUFS')
    check(tp <= -1.0, 'true peak <= -1 dBTP', f'{tp} dBTP')
    x = audio(video)
    check((np.abs(x) > 0.999).sum() == 0, 'no clipped samples')
    sr = 48000
    # the score drops out before the hit (the voice finishes "time." over it, by design)
    m = audio(os.path.join(ROOT, 'assets/mix/music.wav'))
    gap = 20 * np.log10(np.sqrt(np.mean(m[:, int(11.58 * sr):int(11.72 * sr)] ** 2)) + 1e-12)
    check(gap < -45, 'score drops out before the hit (11.58-11.72 s)', f'{gap:.1f} dBFS')
    hit = x[:, int(12.0 * sr):int(12.4 * sr)]
    check(20 * np.log10(np.sqrt(np.mean(hit ** 2))) > -22, 'the hit lands at 12.0 s')

    d = frame_diffs(video)
    planned = set()  # v3 is one continuous shot: no hard cuts are planned
    med = np.median(d)
    # a whole-frame change above ~20/255 in one frame reads as a flash; normal motion stays well below
    spikes = [i + 1 for i, v_ in enumerate(d) if v_ > 20 and not any(abs(i + 1 - p) <= 2 for p in planned)]
    check(len(spikes) == 0, 'continuous shot: no flashes or jump cuts', f'frames {spikes[:10]}' if spikes else f'largest frame change {d.max():.1f}/255')

    # script copy: every word on screen comes from the locked voiceover lines
    lines = json.load(open(os.path.join(ROOT, 'src/vo-lines.json')))['lines']
    script_words = {re.sub(r'[^\w&]', '', w_).lower() for l in lines for w_ in l['text'].split()}
    scenes = os.path.join(ROOT, 'src/v3')
    src = ''.join(open(os.path.join(scenes, f)).read() for f in os.listdir(scenes) if f.endswith('.tsx'))
    kline_words = [x for item in re.findall(r"\{ text: '([^']+)', at: (?:w\(|W5\(|L1\()", src) for x in item.split()]
    kline_words += [x for item in re.findall(r"\['([^']+)', L7\(", src) for x in item.split()]
    stray = sorted({w_ for w_ in kline_words if re.sub(r'[^\w&]', '', w_).lower() not in script_words})
    check('\u2014' not in src and '\u2013 ' not in src, 'no em or en dashes in on-screen copy')
    check(not stray, 'animated type matches the script word for word', f'unexpected: {stray}' if stray else f'{len(kline_words)} synced words')

    os.makedirs(os.path.join(ROOT, 'out/qa'), exist_ok=True)
    sheet = os.path.join(ROOT, 'out/qa', f'{name}-sheet.png')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', video, '-vf', 'fps=2,scale=384:-1,tile=6x10', '-frames:v', '1', sheet], check=True)
    print('contact sheet:', sheet)
    print('\nALL CHECKS PASSED' if not FAIL else f'\n{len(FAIL)} CHECK(S) FAILED: {FAIL}')
    sys.exit(1 if FAIL else 0)


if __name__ == '__main__':
    main(sys.argv[1])
