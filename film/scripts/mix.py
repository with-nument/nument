#!/usr/bin/env python3
"""Final mix: voiceover + score + sound effects -> broadcast-ready stems and mix.

- Sound effects are the website's own sounds (assets/sfx/site, rendered by sfx_render.mjs),
  cued to the voiceover words and scene timings below; the cue list is written to
  src/generated/sfx-cues.json for the cue sheet.
- The score ducks up to 8 dB under the voice; the voice gets an 80 Hz high-pass.
- Loudness: -14 LUFS integrated, true peak <= -1 dBTP (measured with ffmpeg ebur128).
Writes assets/mix/{mix,vo,music,sfx}.wav (48 kHz, 24-bit).
"""
import json
import os
import re
import subprocess
import wave

import numpy as np

SR = 48000
DUR = 30.0
ROOT = os.path.join(os.path.dirname(__file__), '..')
rng = np.random.default_rng(5)


def secs(x):
    return int(round(x * SR))


def load(path, stereo=True):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '2' if stereo else '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4').astype(float)
    return x.reshape(-1, 2).T if stereo else x


def place(track, sig, at, gain_db=0.0, pan=0.0):
    i = secs(at)
    if i >= track.shape[1]:
        return
    g = 10 ** (gain_db / 20)
    l, r = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2), np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    n = min(sig.shape[1], track.shape[1] - i)
    track[0, i:i + n] += sig[0, :n] * g * l
    track[1, i:i + n] += sig[1, :n] * g * r


def highpass(x, fc=80):
    n = x.shape[1]
    N = 1 << (n - 1).bit_length()
    f = np.fft.rfftfreq(N, 1 / SR)
    h = 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-6)) ** 4)  # 2nd-order Butterworth magnitude, zero phase
    return np.vstack([np.fft.irfft(np.fft.rfft(c, N) * h, N)[:n] for c in x])


def envelope(x, attack=0.01, release=0.25):
    e = np.abs(x).max(axis=0)
    out = np.zeros_like(e)
    a, r = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    v = 0.0
    step = 48  # 1 ms resolution, then interpolate
    for i in range(0, len(e), step):
        s = e[i:i + step].max()
        v = a * v + (1 - a) * s if s > v else r * v + (1 - r) * s
        out[i:i + step] = v
    return out


def reverb(x, decay=1.6, damp=10):
    n = secs(decay)
    t = np.arange(n) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = np.convolve(rng.standard_normal(n) * np.exp(-t * 6.9 / decay), np.ones(damp) / damp, 'same')
        ir /= np.sqrt(np.sum(ir ** 2))
        N = 1 << (x.shape[1] + n - 1).bit_length()
        out[ch] = np.fft.irfft(np.fft.rfft(x[ch], N) * np.fft.rfft(ir, N), N)[: x.shape[1]]
    return out


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def ebur128(path):
    out = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    summary = out[out.rfind('Summary:'):]
    lufs = float(re.search(r'I:\s+(-?[\d.]+) LUFS', summary).group(1))
    tp = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', summary).group(1))
    return lufs, tp


def write(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    v = (np.clip(x, -1, 1).T.reshape(-1) * 8388607).astype('<i4')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(np.frombuffer(v.tobytes(), np.uint8).reshape(-1, 4)[:, :3].tobytes())


def limiter(x, ceiling_db=-1.2):
    """Look-ahead peak limiter on a 4x oversampled peak estimate (keeps true peak under the ceiling)."""
    ceiling = 10 ** (ceiling_db / 20)
    n = x.shape[1]
    N = 1 << (n - 1).bit_length()
    up = np.vstack([np.fft.irfft(np.fft.rfft(c, N), N * 4)[: n * 4] * 4 for c in x])
    peak = np.abs(up).max(axis=0).reshape(-1, 4).max(axis=1)
    need = np.minimum(1, ceiling / np.maximum(peak, 1e-9))
    look = secs(0.003)
    g = np.array([need[max(0, i - look):i + look].min() for i in range(0, n, 48)])
    g = np.repeat(g, 48)[:n]
    rel = np.exp(-1 / (0.08 * SR / 48))
    sm = g[::48].copy()
    for i in range(1, len(sm)):
        sm[i] = min(sm[i], rel * sm[i - 1] + (1 - rel) * sm[i])
    g = np.minimum(g, np.repeat(sm, 48)[:n])
    return x * g, float(1 - g.min())


# Peak level (dBFS, before mastering) each kind of sound is placed at; a cue's gain is an offset from this.
# Against the voice at -19 dBFS RMS this keeps ticks felt, whooshes present and accents clear.
TARGET_PEAK = {'tick': -27, 'hover': -27, 'click': -25, 'slice': -24, 'whooshIn': -23, 'whooshOut': -23, 'transition': -22, 'tone': -22, 'chimeOn': -20, 'chimeOff': -22}


def target_peak(sound):
    return TARGET_PEAK['tone'] if sound.startswith('tone') else TARGET_PEAK[sound]


def sfx_cues(cues):
    """Sound design for the v3 film (src/v3/Film3.tsx): (sound, seconds, offset dB, pan -1..1, note).

    Times follow the same voiceover-word keys as the picture, so every morph, flip, click and burst
    lands on its frame. Offsets are relative to TARGET_PEAK.
    """
    W = {c['line']: [w['start'] for w in c['words']] for c in cues}
    c = []
    # 0-3 s: words, the folder, "never built", flip
    for t_ in W['L1'][:4]:
        c.append(('tick', t_, 0, 0, 'word'))
    c.append(('tone-4', W['L1'][4] - 0.05, 0, 0, 'folder pops on "idea"'))
    c.append(('click', W['L1'][4] - 0.04, -2, 0, 'folder pops on "idea"'))
    c.append(('chimeOff', W['L1'][7], 0, 0, 'folder goes hollow on "built"'))
    c.append(('whooshIn', 2.78, 0, -0.3, 'folder flips to clock'))
    # 3-8 s: clock, heart, moon
    for k, at in enumerate((3.0, 4.5, 6.0)):
        c.append(('slice', at - 0.04, -2, (-0.3, 0, 0.3)[k], 'icon flip'))
    t_, gap = 3.08, 0.2
    while t_ < W['L2a'][4] - 0.05:
        c.append(('tick', t_, -2, 0.2, 'clock racing'))
        t_ += gap
        gap = max(0.07, gap * 0.85)
    c.append(('tone-4', W['L2a'][4], 0, 0.1, '"hours" lands'))
    c.append(('hover', W['L2a'][4] + 0.06, 2, 0.3, '"6 hrs saved" chip'))
    c.append(('whooshOut', 4.33, -2, 0.3, 'flip to heart'))
    for k, v in enumerate((5, 7, 8)):
        c.append((f'tone-{v}', W['L2b'][3] + k * 0.06, -1, -0.2 + 0.2 * k, 'hearts on "love"'))
    c.append(('whooshIn', 5.83, -2, -0.3, 'flip to moon'))
    for k in range(3):
        c.append(('hover', 6.15 + k * 0.22, -3, (-0.4, 0.4, 0)[k], 'stars twinkle'))
    c.append(('tone-2', W['L2c'][3], 0, 0.3, '"Rerouted 3:12 AM" ping'))
    # 7.6-12 s: the stalled bar
    c.append(('whooshOut', 7.6, 0, 0, 'moon stretches into the bar'))
    for k in range(6):
        c.append(('tick', 8.15 + k * (0.12 + k * 0.03), -3, -0.3, 'bar crawls'))
    for k in range(4):
        c.append(('click', W['L3b'][1] + k * 0.31, -6, 0.2, 'bar stutters'))
    c.append(('chimeOff', W['L3b'][4], -1, 0, 'bar slips on "time"'))
    c.append(('whooshOut', 11.45, -4, 0, 'blur to white'))
    # 12-14 s: the hit, 12 -> 100, Done, confetti, dive
    c.append(('whooshIn', 12.05, 0, -0.2, 'bar shoots to 100'))
    for k in range(10):
        c.append(('tick', 12.1 + k * 0.075, -1, -0.4 + 0.08 * k, 'counter rolls'))
    c.append(('slice', W['L4'][2] + 0.12, -1, 0, 'bar becomes a circle'))
    c.append(('chimeOn', W['L4'][2] + 0.36, 0, 0, 'check draws'))
    for k, v in enumerate((4, 6, 8, 7)):
        c.append((f'tone-{v}', W['L4'][2] + 0.42 + k * 0.045, -2, (-0.5, 0.5, -0.2, 0.2)[k], 'confetti'))
    for k in range(6):
        c.append(('hover', W['L4'][2] + 0.5 + k * 0.07, -2, rng.uniform(-0.8, 0.8), 'confetti'))
    c.append(('transition', 13.45, 0, 0, 'dive into the circle'))
    # 14-21 s: tunnel, idea -> live, in weeks
    c.append(('whooshIn', 13.95, 0, 0.3, 'tunnel rush'))
    for idx in (1, 3, 4, 6, 8):
        c.append(('tick', W['L5'][idx], -1, 0, 'tunnel word'))
    c.append(('whooshIn', W['L5'][4] + 0.8, -1, -0.3, 'tunnel speeds up'))
    c.append(('whooshOut', 17.72, 0, 0, 'out of the tunnel'))
    c.append(('whooshIn', W['L5'][11] - 0.1, -3, -0.4, 'folder travels to live'))
    c.append(('tone-8', W['L5'][13], 0, 0.4, '"Live"'))
    c.append(('click', W['L5'][13], -2, 0.4, '"Live"'))
    c.append(('transition', W['L5'][14] - 0.42, -2, 0, '"in weeks" arrives'))
    c.append(('tone-6', W['L5'][15], -2, 0.2, '"weeks"'))
    c.append(('whooshOut', 20.45, -3, 0, '"weeks" blurs out'))
    # 21-26 s: deploy, sparkle, cards
    click = W['L6a'][2] - 0.32
    c.append(('whooshIn', 20.7, -2, 0.3, 'deploy card rises'))
    for k in range(4):
        c.append(('tick', 21.1 + k * 0.13, 0, -0.3, 'check passes'))
    c.append(('hover', 21.4, -4, 0.5, 'cursor moves'))
    c.append(('click', click, 2, 0.3, 'deploy click'))
    c.append(('chimeOn', click + 0.16, -1, 0.2, 'button becomes the sparkle'))
    c.append(('tone-7', W['L6a'][2], -2, 0, 'sparkle at the core'))
    c.append(('transition', W['L6b'][0] - 0.45, 0, 0, 'sparkle bursts into cards'))
    for k in range(8):
        c.append(('hover', W['L6b'][0] + k * 0.05, -1, (-0.8, 0.8)[k % 2] * (0.4 + 0.07 * k), 'cards fly out'))
    c.append(('whooshIn', 25.38, 0, 0, 'cards rush past'))
    # 26-30 s: end card (the score carries the resolve)
    c.append(('tone-8', W['L7a'][0] - 0.02, -3, 0.3, 'glint into the wordmark'))
    c.append(('chimeOn', W['L7b'][5] + 0.65, -2, 0, 'nument.in'))
    return [{'sound': s_, 'at': round(t_, 3), 'gainDb': g, 'pan': round(p_, 2), 'note': n} for s_, t_, g, p_, n in c]


def main():
    cues = json.load(open(os.path.join(ROOT, 'src/generated/vo-cues.json')))['cues']
    n = secs(DUR)

    # voiceover
    vo = np.zeros((2, n))
    for c in cues:
        x = load(os.path.join(ROOT, 'assets/vo/takes', c['take'] + '.wav'))
        place(vo, x, c['at'])
    vo = highpass(vo, 80)
    vo /= np.abs(vo).max()
    # consonant spikes are ~0.7% of samples; a look-ahead limiter 8 dB down takes the crest
    # factor from ~20 dB to ~14 dB without touching the body of the voice
    vo, _ = limiter(vo, -8.0)
    speaking = envelope(vo, 0.02, 0.35) > 10 ** (-38 / 20)
    vo *= 10 ** ((-19 - rms_db(vo[:, speaking])) / 20)

    # score, ducked under the voice
    music = load(os.path.join(ROOT, 'assets/music/music.wav'))[:, :n]
    music = np.pad(music, ((0, 0), (0, n - music.shape[1])))
    e = envelope(vo, 0.02, 0.35)
    duck = 1 - (1 - 10 ** (-8 / 20)) * np.clip(e / (10 ** (-30 / 20)), 0, 1)
    music_active = music[:, np.abs(music).max(axis=0) > 1e-3]
    music *= 10 ** ((-23 - rms_db(music_active)) / 20) * duck

    # sound effects
    meta = json.load(open(os.path.join(ROOT, 'assets/sfx/site/meta.json')))
    sfx_dry, sfx_wet = np.zeros((2, n)), np.zeros((2, n))
    sounds = {}
    cue_list = sfx_cues(cues)
    for cue in cue_list:
        s = sounds.setdefault(cue['sound'], load(os.path.join(ROOT, 'assets/sfx/site', cue['sound'] + '.wav')))
        # level every sound to its type's target peak, then apply the cue's offset
        gain = target_peak(cue['sound']) - 20 * np.log10(np.abs(s).max() + 1e-9) + cue['gainDb']
        place(sfx_dry, s, cue['at'], gain, cue['pan'])
        place(sfx_wet, s, cue['at'], gain + 20 * np.log10(max(meta[cue['sound']]['reverb'], 1e-3) * 2.5), cue['pan'])
    sfx = sfx_dry + reverb(sfx_wet)
    json.dump({'cues': cue_list}, open(os.path.join(ROOT, 'src/generated/sfx-cues.json'), 'w'), indent=1)

    # loudness: measure the summed mix, set one gain for everything, then limit the mix only
    mix = vo + music + sfx
    tmp = os.path.join(ROOT, 'out/.premix.wav')
    write(tmp, mix * 0.5)
    lufs, _ = ebur128(tmp)
    gain = 10 ** ((-14 - (lufs + 20 * np.log10(2))) / 20)  # the temp file was written at half level
    out = os.path.join(ROOT, 'assets/mix')
    for _ in range(3):  # the limiter shaves a little loudness; re-measure and correct
        limited, reduction = limiter(mix * gain, -1.2)
        write(os.path.join(out, 'mix.wav'), limited)
        lufs, tp = ebur128(os.path.join(out, 'mix.wav'))
        if abs(lufs + 14) < 0.15:
            break
        gain *= 10 ** ((-14 - lufs) / 20)
    vo, music, sfx = vo * gain, music * gain, sfx * gain
    stem_peak = max(np.abs(x).max() for x in (vo, music, sfx))
    for name, x in (('vo', vo), ('music', music), ('sfx', sfx)):
        write(os.path.join(out, f'{name}.wav'), x)
    print(f'loudest stem peak {20 * np.log10(stem_peak):.1f} dBFS (stems are pre-limiter and sum to the mix)')
    os.remove(tmp)
    # how far the score sits under the voice while she speaks
    speaking = e > 10 ** (-30 / 20)
    under = rms_db(vo[:, speaking]) - rms_db(music[:, speaking])
    print(f'mix: {lufs:.1f} LUFS, true peak {tp:.1f} dBTP, limiter max reduction {20 * np.log10(1 - reduction + 1e-9):.1f} dB')
    print(f'voice sits {under:.1f} dB above the score while speaking; {len(cue_list)} sound-effect cues')


if __name__ == '__main__':
    main()
