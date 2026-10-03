"""Minimal Gemini API client for image generation (Nano Banana Pro). Standard library only."""

import base64
import json
import mimetypes
import os
import time
import urllib.error
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
API = 'https://generativelanguage.googleapis.com/v1beta'
IMAGE_MODEL = 'gemini-3-pro-image'


def load_key():
    with open(os.path.join(ROOT, '.env.local')) as f:
        for line in f:
            if line.startswith('GEMINI_API_KEY='):
                return line.split('=', 1)[1].strip().strip('"\'')
    raise RuntimeError('GEMINI_API_KEY missing from .env.local')


def _post(url, body, timeout=600):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'x-goog-api-key': load_key()},
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.load(res)


def _image_part(path):
    mime = mimetypes.guess_type(path)[0] or 'image/png'
    with open(path, 'rb') as f:
        return {'inline_data': {'mime_type': mime, 'data': base64.b64encode(f.read()).decode()}}


def generate_image(prompt, aspect='16:9', size='2K', refs=(), retries=3):
    """Returns (bytes, mime) of the generated image."""
    parts = [{'text': prompt}] + [_image_part(p) for p in refs]
    body = {
        'contents': [{'role': 'user', 'parts': parts}],
        'generationConfig': {
            'responseModalities': ['IMAGE'],
            'imageConfig': {'aspectRatio': aspect, 'imageSize': size},
        },
    }
    url = f'{API}/models/{IMAGE_MODEL}:generateContent'
    for attempt in range(retries + 1):
        try:
            res = _post(url, body)
            images = [
                p['inlineData']
                for c in res.get('candidates', [])
                for p in c.get('content', {}).get('parts', [])
                if 'inlineData' in p and not p.get('thought')
            ]
            if not images:
                reason = [c.get('finishReason') for c in res.get('candidates', [])]
                raise RuntimeError(f'no image returned (finishReason={reason})')
            img = images[-1]
            return base64.b64decode(img['data']), img.get('mimeType', 'image/png')
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code in (429, 500, 502, 503, 504) and attempt < retries:
                time.sleep(20 * (attempt + 1))
                continue
            raise RuntimeError(f'HTTP {e.code}: {msg}') from None
        except (RuntimeError, urllib.error.URLError, TimeoutError):
            if attempt < retries:
                time.sleep(10)
                continue
            raise
