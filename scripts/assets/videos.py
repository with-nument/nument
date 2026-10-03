"""Generate the cinematic project videos with Veo 3.1 Fast (image-to-video), then encode them for the web.

Each video brings a project's cover art to life.
Usage: python3 scripts/assets/videos.py [name,...] [--reencode]
"""

import base64
import io
import json
import os
import subprocess
import sys
import time
import urllib.request

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from gemini import API, ROOT, _post, load_key  # noqa: E402

MODEL = 'veo-3.1-fast-generate-preview'
RAW = os.path.join(os.path.dirname(__file__), 'raw')

# Veo animates the text-free cover art (it can't keep UI text crisp across a clip). Product-screen
# demos are rendered separately by ui_motion.mjs.
CINEMATIC = (
    'Slow, elegant cinematic motion with a very gentle push-in of the camera; premium product film, '
    'soft studio lighting, shallow depth of field, photorealistic, seamless and calm. No text, no letters, no logos, no people.'
)
NEGATIVE = 'text, letters, words, logos, watermark, people, hands, fast motion, shaky camera, flicker, distortion'

VIDEOS = [
    {
        'name': 'founder-placeholder',
        'start': 'brand/studio.png',
        'out': 'videos/founder-message.mp4',
        'prompt': 'A very slow, smooth cinematic dolly-in through a calm, sunlit minimalist studio toward the large wall screen with its '
        'glowing blue neural-network visual, which pulses gently; dust motes drift in the warm golden light and soft shadows move slowly. ' + CINEMATIC,
    },
    {
        'name': 'p3-cover',
        'start': 'project3/cover.png',
        'out': 'project3/video.mp4',
        'prompt': 'The translucent glass waveform ribbon ripples slowly like sound travelling through it; electric-blue light flows along the '
        'glass from left to right and the glowing horizontal lines at its end pulse softly one after another; caustics shimmer on the stone plinth. ' + CINEMATIC,
    },
    {
        'name': 'p1-cover',
        'start': 'project1/cover.png',
        'out': 'project1/video.mp4',
        'prompt': 'The frosted-glass speech bubble floats and turns very slightly; the warm coral glow inside it breathes softly, '
        'the silk scarf drifts as if in a light breeze, and a subtle teal rim light sweeps across the objects. ' + CINEMATIC,
    },
    {
        'name': 'p2-cover',
        'start': 'project2/cover.png',
        'out': 'project2/video.mp4',
        'prompt': 'The pale lime beam of light enters the deep indigo glass prism and the rising staircase of light bars builds up '
        'one bar at a time; soft lavender caustics ripple on the surface below as the prism rotates very slightly. ' + CINEMATIC,
    },
]


def center_16x9(path):
    """Veo takes 16:9 input; crop the wide cover around its centred subject."""
    img = Image.open(path).convert('RGB')
    w = round(img.height * 16 / 9)
    if w < img.width:
        left = (img.width - w) // 2
        img = img.crop((left, 0, left + w, img.height))
    buf = io.BytesIO()
    img.save(buf, 'PNG')
    return buf.getvalue()


def start_operation(video):
    image = base64.b64encode(center_16x9(os.path.join(RAW, video['start']))).decode()
    body = {
        'instances': [{'prompt': video['prompt'], 'image': {'bytesBase64Encoded': image, 'mimeType': 'image/png'}}],
        'parameters': {'aspectRatio': '16:9', 'resolution': '1080p', 'durationSeconds': 8, 'negativePrompt': NEGATIVE},
    }
    return _post(f'{API}/models/{MODEL}:predictLongRunning', body)['name']


def wait(operation):
    while True:
        req = urllib.request.Request(f'{API}/{operation}', headers={'x-goog-api-key': load_key()})
        with urllib.request.urlopen(req, timeout=120) as res:
            data = json.load(res)
        if data.get('done'):
            if 'error' in data:
                raise RuntimeError(data['error'].get('message'))
            samples = data['response']['generateVideoResponse'].get('generatedSamples') or []
            if not samples:
                raise RuntimeError(f"no video returned: {json.dumps(data['response'])[:300]}")
            return samples[0]['video']['uri']
        time.sleep(10)


def download(uri, path):
    req = urllib.request.Request(uri, headers={'x-goog-api-key': load_key()})
    with urllib.request.urlopen(req, timeout=600) as res, open(path, 'wb') as f:
        f.write(res.read())


def encode(src, out, fade=0.75, length=8.0):
    """Silent, web-friendly H.264 at 1920x1080 that loops seamlessly: the clip's tail crossfades into its
    first frames, so the last frame matches the first. Starts playing before it fully downloads."""
    graph = (
        f'[0:v]scale=1920:1080:flags=lanczos,format=yuv420p,split[a][b];'
        f'[a]trim={fade}:{length},setpts=PTS-STARTPTS[body];'
        f'[b]trim=0:{fade},setpts=PTS-STARTPTS[head];'
        f'[body][head]xfade=transition=fade:duration={fade}:offset={length - 2 * fade}[v]'
    )
    subprocess.run(
        ['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-an', '-filter_complex', graph, '-map', '[v]',
         '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-movflags', '+faststart', os.path.join(ROOT, 'public', out)],
        check=True,
    )


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    only = set(args[0].split(',')) if args else None
    os.makedirs(os.path.join(RAW, 'videos'), exist_ok=True)
    selected = [v for v in VIDEOS if not only or v['name'] in only]
    if '--reencode' in sys.argv:  # re-encode the downloaded clips without calling the API again
        for v in selected:
            encode(os.path.join(RAW, 'videos', f"{v['name']}.mp4"), v['out'])
            print(f"ok   {v['name']} -> public/{v['out']}", flush=True)
        return
    # Start every generation first, then collect them: Veo runs them in parallel.
    operations = []
    for v in selected:
        try:
            operations.append((v, start_operation(v)))
            print(f"started {v['name']}", flush=True)
        except Exception as e:
            print(f"FAIL start {v['name']}: {e}", flush=True)
    for v, op in operations:
        try:
            raw = os.path.join(RAW, 'videos', f"{v['name']}.mp4")
            download(wait(op), raw)
            encode(raw, v['out'])
            print(f"ok   {v['name']} -> public/{v['out']}", flush=True)
        except Exception as e:
            print(f"FAIL {v['name']}: {e}", flush=True)


if __name__ == '__main__':
    main()
