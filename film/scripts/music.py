#!/usr/bin/env python3
"""Original score for the Nument film, synthesised offline with numpy (no samples, no licences).

120 BPM in A minor, resolving to C major on the end card. Structure follows src/timeline.json
and the voiceover word timings in src/generated/vo-cues.json:
  0-3   intro pad + droplets on each word of line 1, riser into the first whip
  3-8   light groove (half-time kick, offbeat hats, arp)
  8-12  drain: tape-stop, darkening pad, heartbeat, silence from 11.55
  12-14 hit: impact + sub drop + bright chord, arp builds back
  14-21 full groove
  21-26 breakdown under "Senior engineering", groove returns on "AI at the core"
  26-30 resolve to C major, long tail
Writes assets/music/music.wav (master) and assets/music/stems/*.wav (pre-master buses).
"""
import json
import os
import wave

import numpy as np

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), '..')
rng = np.random.default_rng(11)
BEAT = 0.5
DUR = 30.0


def secs(x):
    return int(round(x * SR))


def T(d):
    return np.arange(secs(d)) / SR


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, r):
    e = np.ones(n)
    na = max(1, min(n, secs(a)))
    e[:na] = np.linspace(0, 1, na) ** 1.6
    nr = max(1, min(n, secs(r)))
    e[n - nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def smooth(x, k):
    k = max(1, int(k))
    return np.convolve(x, np.ones(k) / k, 'same')


# ---------- instruments ----------
def pad(m, dur, b0=600, b1=1600, a=0.6, r=1.2, cents=7):
    t = T(dur + r)
    out = np.zeros(len(t))
    cutoff = np.interp(t, [0, dur + r], [b0, b1])
    for c in (-cents, 0, cents):
        f = hz(m) * 2 ** (c / 1200)
        for k in range(1, 40):
            if f * k > 8000:
                break
            out += (1 / k) * np.exp(-f * k / cutoff) * np.sin(2 * np.pi * f * k * t + rng.uniform(0, 2 * np.pi))
    out *= 1 + 0.07 * np.sin(2 * np.pi * 0.21 * t + rng.uniform(0, 6))
    return out * env(len(t), a, r) / 3


def pluck(m, dur=1.0, bright=1.0, decay=3.2):
    t = T(dur)
    out = np.zeros(len(t))
    f = hz(m)
    for k in range(1, 18):
        if f * k > 14000:
            break
        out += (1 / k ** 1.4) * np.exp(-t * (decay + k * 1.8 / bright)) * np.sin(2 * np.pi * f * k * t)
    return out * (1 - np.exp(-t / 0.0015)) * env(len(t), 0, 0.05)


def piano(m, dur=3.0):
    t = T(dur)
    out = np.zeros(len(t))
    f = hz(m)
    for k in range(1, 14):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > 10000:
            break
        out += (0.9 ** k / k ** 0.6) * np.exp(-t * (0.8 + 0.5 * k)) * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6))
    hammer = smooth(rng.standard_normal(len(t)) * np.exp(-t * 90), 30) * 0.4
    return (out * (1 - np.exp(-t / 0.006)) + hammer) * env(len(t), 0, 0.4)


def bell(m, dur=1.6):
    t = T(dur)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t + 1.2 * np.exp(-t * 4) * np.sin(2 * np.pi * f * 3.5 * t))
    return s * (1 - np.exp(-t / 0.002)) * np.exp(-t * 2.4) * env(len(t), 0, 0.2)


def kick(level=1.0):
    t = T(0.55)
    f = 44 + 100 * np.exp(-t * 30)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = smooth(rng.standard_normal(len(t)), 3) * np.exp(-t * 350) * 0.18
    return (s + click) * env(len(t), 0, 0.05) * level


def hat(level=1.0, decay=75):
    t = T(0.1)
    n = np.diff(np.diff(rng.standard_normal(len(t)), prepend=0), prepend=0) / 4
    return n * np.exp(-t * decay) * level


def clap(level=1.0):
    t = T(0.4)
    n = smooth(np.diff(rng.standard_normal(len(t)), prepend=0), 3)
    e = np.zeros(len(t))
    for d in (0, 0.011, 0.022):
        e += (t >= d) * np.exp(-np.clip(t - d, 0, None) * 170)
    e += (t >= 0.03) * np.exp(-np.clip(t - 0.03, 0, None) * 15) * 0.5
    return n * e * level


def sub(m, dur, level=1.0):
    t = T(dur)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)
    return s * env(len(t), 0.008, min(0.07, dur / 2)) * level


def riser(dur, level=1.0):
    t = T(dur)
    x = t / dur
    n = rng.standard_normal(len(t))
    s = (smooth(n, 180) * np.sqrt(180) * (1 - x) + n * x * 0.55) * x ** 2.3 * 0.5
    sweep = np.sin(2 * np.pi * np.cumsum(220 + 1500 * x ** 2) / SR) * 0.22 * x ** 3
    return (s + sweep) * level * env(len(t), 0, 0.02)


def reverse_swell(dur):
    """A reversed cymbal-like breath that sucks into the downbeat."""
    t = T(dur)
    n = rng.standard_normal(len(t))
    bright = n - smooth(n, 6)
    return (bright * 0.5 + smooth(n, 40) * 2) * (t / dur) ** 3


def impact(level=1.0, dur=2.6):
    t = T(dur)
    f = 60 * np.exp(-t * 0.7) + 30
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.0)
    noise = smooth(rng.standard_normal(len(t)), 30) * np.sqrt(30) * np.exp(-t * 8) * 0.35
    return (boom + noise) * env(len(t), 0.002, 0.4) * level


def sub_drop(dur=1.6):
    t = T(dur)
    f = 110 * np.exp(-t * 2.2) + 32
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.3) * env(len(t), 0.003, 0.3)


def tape_stop(m, dur=0.45):
    t = T(dur)
    f = hz(m) * (1 - t / dur) ** 1.8 + 20
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return s * (1 - t / dur) ** 0.7


# ---------- processing ----------
def reverb(x, decay=2.4, damp=12, pre=0.02):
    n = secs(decay)
    t = np.arange(n) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = smooth(rng.standard_normal(n) * np.exp(-t * 6.9 / decay), damp)
        ir = np.concatenate([np.zeros(secs(pre)), ir])
        ir /= np.sqrt(np.sum(ir ** 2))
        N = 1 << (x.shape[1] + len(ir) - 1).bit_length()
        out[ch] = np.fft.irfft(np.fft.rfft(x[ch], N) * np.fft.rfft(ir, N), N)[: x.shape[1]]
    return out


class Mix:
    def __init__(self):
        self.buses = {}

    def add(self, bus, sig, at, pan=0.5, gain=1.0):
        x = self.buses.setdefault(bus, np.zeros((2, secs(DUR + 4))))
        i = secs(at)
        if sig.ndim == 1:
            sig = np.vstack([sig * np.cos(pan * np.pi / 2), sig * np.sin(pan * np.pi / 2)]) * np.sqrt(2)
        n = min(sig.shape[1], x.shape[1] - i)
        if n > 0:
            x[:, i:i + n] += sig[:, :n] * gain


def pump(x, beats, depth=0.45, speed=13):
    g = np.ones(x.shape[1])
    for b in beats:
        i = secs(b)
        m = min(x.shape[1] - i, secs(0.45))
        if m > 0:
            tt = np.arange(m) / SR
            g[i:i + m] = np.minimum(g[i:i + m], 1 - depth * np.exp(-tt * speed))
    return x * g


def gain_curve(x, points):
    """Piecewise-linear gain automation: points = [(sec, gain), ...]."""
    tt = np.arange(x.shape[1]) / SR
    return x * np.interp(tt, [p[0] for p in points], [p[1] for p in points])


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def level(x, target_db):
    active = x[:, np.max(np.abs(x), axis=0) > 1e-4]
    return x if active.size == 0 else x * 10 ** ((target_db - rms_db(active)) / 20)


def write(path, x, bits=24):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setframerate(SR)
        if bits == 24:
            w.setsampwidth(3)
            v = (x.T.reshape(-1) * 8388607).astype('<i4')
            w.writeframes(np.frombuffer(v.tobytes(), np.uint8).reshape(-1, 4)[:, :3].tobytes())
        else:
            w.setsampwidth(2)
            w.writeframes((x.T.reshape(-1) * 32767).astype('<i2').tobytes())


# ---------- score ----------
CH = {
    'Am9': (45, [57, 60, 64, 71]),
    'Fmaj7': (41, [53, 57, 60, 64]),
    'Cadd9': (48, [55, 60, 62, 64]),
    'G6': (43, [55, 59, 62, 64]),
    'Cres': (36, [60, 64, 67, 74]),
}
PANS = [0.3, 0.45, 0.55, 0.7]


def chord(mix, name, at, dur, bus='pad', **kw):
    for p, m in zip(PANS, CH[name][1]):
        mix.add(bus, pad(m, dur, **kw), at, pan=p)


def arp(mix, name, a, b, step, octave=12, gain=1.0, pattern=(0, 2, 1, 3, 2, 1, 3, 2), bright=1.0):
    notes = CH[name][1]
    k, at = 0, a
    while at < b - 1e-6:
        mix.add('arp', pluck(notes[pattern[k % len(pattern)]] + octave, 0.8, bright=bright) * (1.0 if k % 2 == 0 else 0.72) * gain, at, pan=0.36 if k % 2 == 0 else 0.64)
        k += 1
        at += step


def bassline(mix, name, a, b, step=0.25, length=0.2, gain=1.0):
    root = CH[name][0]
    root = root - 12 if root > 44 else root
    at = a
    while at < b - 1e-6:
        mix.add('bass', sub(root, length) * gain, at)
        at += step


def compose():
    cues = {c['line']: c for c in json.load(open(os.path.join(ROOT, 'src/generated/vo-cues.json')))['cues']}
    mix = Mix()
    pump_beats = []

    # 0-3 intro
    chord(mix, 'Am9', 0.0, 3.0, b0=320, b1=900, a=1.4, r=1.0)
    droplets = [76, 81, 79, 84, 83, 81, 79, 76]
    for i, wd in enumerate(cues['L1']['words']):
        mix.add('arp', pluck(droplets[i % len(droplets)], 1.2, decay=4) * 0.55, wd['start'], pan=0.3 + 0.4 * (i % 2))
    mix.add('fx', riser(0.65), 2.32)

    # 3-8 light groove
    for name, a, b in [('Am9', 3, 5), ('Fmaj7', 5, 7), ('Cadd9', 7, 8)]:
        chord(mix, name, a, b - a, b0=700, b1=1700, a=0.12, r=0.5)
        bassline(mix, name, a, b, step=0.5, length=0.32, gain=0.85)
        arp(mix, name, a, b, 0.25, gain=0.75)
    for k in np.arange(3, 8, 1.0):
        mix.add('drums', kick(0.85), k)
        pump_beats.append(k)
    for k in np.arange(3.25, 8, 0.5):
        mix.add('drums', hat(0.55), k, pan=0.6)

    # 8-12 drain
    mix.add('fx', tape_stop(57), 7.98)
    chord(mix, 'Fmaj7', 8.0, 3.5, b0=650, b1=180, a=0.05, r=0.6)
    mix.add('bass', sub(29, 3.4, 0.7), 8.05)
    for k in (8.5, 9.5, 10.5, 11.0):
        mix.add('drums', kick(0.55), k)

    # 12-14 the turn
    mix.add('fx', impact(1.0), 12.0)
    mix.add('fx', sub_drop(), 12.0)
    chord(mix, 'Cadd9', 12.0, 1.5, b0=1400, b1=2400, a=0.02, r=0.8)
    for m in (60, 64, 67, 74):
        mix.add('keys', piano(m, 2.4), 12.0)
    chord(mix, 'G6', 13.5, 0.5, b0=1200, b1=2000, a=0.2, r=0.3)
    arp(mix, 'Cadd9', 13.0, 13.5, 0.125, gain=0.45)
    arp(mix, 'G6', 13.5, 14.0, 0.125, gain=0.6)
    mix.add('fx', riser(0.8), 13.2)
    for i in range(8):
        mix.add('drums', hat(0.25 + i * 0.06), 13.5 + i * 0.0625, pan=0.6)

    # 14-21 full groove
    for name, a, b in [('Am9', 14, 16), ('Fmaj7', 16, 18), ('Cadd9', 18, 20), ('G6', 20, 21)]:
        chord(mix, name, a, b - a, b0=900, b1=1900, a=0.06, r=0.4)
        bassline(mix, name, a, min(b, 20.5), step=0.25, length=0.19)
        arp(mix, name, a, min(b, 20.5), 0.125, gain=0.65, bright=1.3)
    for k in np.arange(14, 20.5, 0.5):
        mix.add('drums', kick(1.0), k)
        pump_beats.append(k)
    for k in np.arange(14.5, 20.5, 1.0):
        mix.add('drums', clap(0.8), k)
    for i, k in enumerate(np.arange(14, 20.5, 0.125)):
        mix.add('drums', hat(0.5 if i % 2 else 0.22), k, pan=0.62)
    mix.add('fx', riser(0.6), 20.4)

    # 21-26 breakdown, then the core
    chord(mix, 'Fmaj7', 21.0, 2.0, b0=500, b1=1500, a=0.3, r=0.6)
    arp(mix, 'Fmaj7', 21.0, 22.3, 0.25, gain=0.5, bright=0.8)
    core = cues['L6a']['words'][2]['start'] - 0.1
    mix.add('fx', impact(0.55, 2.0), core)
    for i, m in enumerate((79, 84, 86, 91)):
        mix.add('keys', bell(m, 1.8) * 0.5, core + i * 0.06, pan=0.3 + i * 0.13)
    for name, a, b in [('Cadd9', 22.5, 24.5), ('G6', 24.5, 25.75)]:
        chord(mix, name, a, b - a, b0=1000, b1=2100, a=0.05, r=0.4)
        bassline(mix, name, a, b, step=0.25, length=0.19)
        arp(mix, name, a, b, 0.125, gain=0.6, bright=1.3)
    for k in np.arange(22.5, 25.75, 0.5):
        mix.add('drums', kick(0.95), k)
        pump_beats.append(k)
    for k in np.arange(23.0, 25.75, 1.0):
        mix.add('drums', clap(0.7), k)
    for i, k in enumerate(np.arange(22.5, 25.75, 0.125)):
        mix.add('drums', hat(0.45 if i % 2 else 0.2), k, pan=0.62)
    mix.add('fx', riser(0.75), 25.3)

    # 26-30 resolve
    nument = cues['L7a']['words'][0]['start']
    mix.add('fx', impact(0.6, 2.4), 26.0)
    chord(mix, 'Cres', 26.0, 4.0, b0=1300, b1=2600, a=0.05, r=1.2)
    for m in (48, 60, 64, 67, 74):
        mix.add('keys', piano(m, 3.6) * (0.8 if m == 48 else 1), nument - 0.02)
    mix.add('bass', sub(36, 3.6, 0.9), 26.0)
    arp(mix, 'Cres', 26.5, 28.4, 0.25, gain=0.42, pattern=(0, 1, 2, 3, 2, 1))
    end_card = cues['L7b']['words'][-1]['start'] + 0.45
    for m in (72, 79, 84):
        mix.add('keys', piano(m, 2.4) * 0.7, end_card)

    # pump pads on the kicks, then bus levels (dB RMS) and sends
    mix.buses['pad'] = pump(mix.buses['pad'], pump_beats, depth=0.4)
    mix.buses['bass'] = pump(mix.buses['bass'], pump_beats, depth=0.25)
    levels = {'pad': -21, 'arp': -26, 'bass': -22, 'drums': -21, 'fx': -24, 'keys': -24}
    sends = {'pad': 0.22, 'arp': 0.4, 'keys': 0.45, 'fx': 0.3, 'drums': 0.04}
    total = np.zeros((2, secs(DUR + 4)))
    wet = np.zeros_like(total)
    stems = {}
    for name, x in mix.buses.items():
        y = level(x, levels[name])
        stems[name] = y
        total += y
        wet += y * sends.get(name, 0)
    total += reverb(wet)
    # silence the bar before the hit (everything but the reverse swell)
    total = gain_curve(total, [(0, 1), (11.3, 1), (11.55, 0.0), (11.98, 0.0), (12.0, 1), (DUR + 4, 1)])
    # the reverse swell is added after the silence so it alone breathes into the hit
    swell = np.zeros_like(total)
    i0 = secs(11.62)
    rs = reverse_swell(0.38)
    rs = np.vstack([rs, rs]) * 10 ** ((-24 - rms_db(np.vstack([rs, rs]))) / 20)
    swell[:, i0:i0 + rs.shape[1]] = rs
    total += swell
    total = total[:, : secs(DUR)]
    fade = secs(0.5)
    total[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
    total -= total.mean(axis=1, keepdims=True)
    total *= 10 ** (-3 / 20) / np.max(np.abs(total))
    write(os.path.join(ROOT, 'assets/music/music.wav'), total)
    for name, y in stems.items():
        write(os.path.join(ROOT, f'assets/music/stems/music-{name}.wav'), np.clip(y[:, : secs(DUR)] * 0.5, -1, 1))
    seg = secs(1.0)
    print('music loudness per second (dBFS):', [round(rms_db(total[:, i:i + seg]), 1) for i in range(0, total.shape[1], seg)])


if __name__ == '__main__':
    compose()
