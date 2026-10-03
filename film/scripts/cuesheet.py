#!/usr/bin/env python3
"""Writes the editors' cue sheet (CSV + Markdown) from the same data the film is built from.

Sources: src/timeline.json (sections, music markers), src/generated/vo-cues.json (voice),
src/generated/sfx-cues.json (sound effects). Output: out/handoff/cue-sheet.{csv,md}
"""
import csv
import json
import os

ROOT = os.path.join(os.path.dirname(__file__), '..')
FPS = 60


def tc(sec):
    """SMPTE-style timecode at 60 fps: HH:MM:SS:FF."""
    f = round(sec * FPS)
    return f'00:{f // (60 * FPS):02d}:{(f // FPS) % 60:02d}:{f % FPS:02d}'


def main():
    tl = json.load(open(os.path.join(ROOT, 'src/timeline.json')))
    vo = json.load(open(os.path.join(ROOT, 'src/generated/vo-cues.json')))['cues']
    sfx = json.load(open(os.path.join(ROOT, 'src/generated/sfx-cues.json')))['cues']
    W = {c['line']: [x['start'] for x in c['words']] for c in vo}
    shots = [
        (0.0, 'S1', 'Centred words blur into focus; glass folder springs in on "idea"; goes hollow on "built"'),
        (2.78, 'S2', 'Folder flips into the clock tile (motion blur)'),
        (3.0, 'S2', '"A tool that saves hours." Clock races, settles on "hours"; "6 hrs saved" chip'),
        (4.5, 'S2', 'Flip to heart: "An app customers love." Glass hearts drift up'),
        (6.0, 'S2', 'Flip to moon: "An agent that never sleeps." "Rerouted 3:12 AM" pill'),
        (7.6, 'S3', 'Moon tile stretches into the progress bar; crawls to 12/100 and stalls'),
        (W['L3b'][0], 'S3', '"Not enough engineers." Bar stutters; "Not enough time." Counter slips'),
        (11.5, 'S3', 'Blur to white; score drops out'),
        (12.0, 'S4', 'Hit: bar returns and shoots 12 to 100 with "Nument changes that."'),
        (W['L4'][2] + 0.12, 'S4', 'Bar becomes a circle, check draws, "Done", confetti'),
        (13.45, 'S4', 'Camera dives into the circle'),
        (13.9, 'S5', 'Flight through a tunnel of real product screens; "We design and build" / "AI agents. Apps. Internal tools."'),
        (17.72, 'S5', 'Out of the tunnel to white'),
        (W['L5'][10] - 0.15, 'S5', '"From idea to live." Folder travels the line and becomes the Live badge'),
        (W['L5'][14] - 0.1, 'S5', '"in weeks." zoom-blur arrival'),
        (20.7, 'S6', 'Deploy card tilts up; checks pass; cursor clicks "Deploy to production"'),
        (W['L6a'][2] - 0.17, 'S6', 'Button becomes the sparkle: "AI at the core."'),
        (W['L6b'][0] - 0.05, 'S6', 'Sparkle bursts into floating product cards: "Built around the way you work."'),
        (25.4, 'S6', 'Cards rush past the camera to white'),
        (25.9, 'S7', 'Sparkle glint, "Nument", "Built in India, for the world.", nument.in; hold'),
    ]
    rows = [(s, 'SHOT', sec, desc) for s, sec, desc in shots]
    rows += [(c['speechStart'], 'VOICE', c['section'], f"{c['line']}: {c['text']}  (take {c['take']})") for c in vo]
    rows += [(c['at'], 'SFX', '', f"{c['sound']} · {c['note']} · {c['gainDb']:+.0f} dB · pan {c['pan']:+.1f}") for c in sfx]
    rows += [(v, 'MUSIC', '', k) for k, v in tl['music'].items()]
    rows.sort(key=lambda r: (r[0], ['SHOT', 'MUSIC', 'VOICE', 'SFX'].index(r[1])))

    out = os.path.join(ROOT, 'out/handoff')
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, 'cue-sheet.csv'), 'w', newline='') as f:
        wr = csv.writer(f)
        wr.writerow(['timecode', 'seconds', 'type', 'section', 'description'])
        for sec, kind, sect, desc in rows:
            wr.writerow([tc(sec), f'{sec:.3f}', kind, sect, desc])
    with open(os.path.join(out, 'cue-sheet.md'), 'w') as f:
        f.write('# Nument film · cue sheet (30 s, 1920x1080, 60 fps)\n\n| Timecode | Type | Section | Cue |\n|---|---|---|---|\n')
        for sec, kind, sect, desc in rows:
            if kind == 'SFX':
                continue
            f.write(f'| {tc(sec)} | {kind} | {sect} | {desc} |\n')
        f.write(f'\nSound-effect cues ({len(sfx)}) are listed in cue-sheet.csv.\n')
    print(f'cue sheet: {len(rows)} rows -> out/handoff/cue-sheet.csv, cue-sheet.md')


if __name__ == '__main__':
    main()
