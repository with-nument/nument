"""Generate site images with Nano Banana Pro and write them, at their original sizes, into public/.

Usage:
  python3 scripts/assets/generate.py project3            # whole group
  python3 scripts/assets/generate.py project3 --only 1,7  # just these jobs
"""

import argparse
import io
import os
import sys
from concurrent.futures import ThreadPoolExecutor

from PIL import Image, ImageOps

sys.path.insert(0, os.path.dirname(__file__))
from gemini import ROOT, generate_image  # noqa: E402
from jobs import BIG, GROUPS, MEDIUM, SMALL  # noqa: E402

# Desktop screens lose a little height when cropped: take more from the bottom than the top bar.
DEFAULT_CENTERING = {BIG: (0.5, 0.3), MEDIUM: (0.5, 0.3)}

RAW = os.path.join(os.path.dirname(__file__), 'raw')
RECROP = '--recrop' in sys.argv  # re-crop existing raw images without calling the API


def edge_color(img, rows):
    """Median colour of a band of rows (used to extend a screen's own background)."""
    band = img.crop((0, rows[0], img.width, rows[1])).resize((1, 1), Image.Resampling.BOX)
    return band.getpixel((0, 0))


def pad_to(img, size, top_share=0.35):
    """Fit to the target width, then extend top/bottom with the edge background instead of cropping the sides."""
    w, h = size
    img = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    if img.height >= h:
        return ImageOps.fit(img, size, Image.LANCZOS)
    extra = h - img.height
    top = round(extra * top_share)
    canvas = Image.new('RGB', size, edge_color(img, (0, 6)))
    canvas.paste(Image.new('RGB', (w, h - top - img.height), edge_color(img, (img.height - 6, img.height))), (0, top + img.height))
    canvas.paste(img, (0, top))
    return canvas


def save_final(img, out, size, centering=(0.5, 0.5), fit='crop'):
    """Bring the image to the display box's aspect ratio and target pixel size, then save."""
    img = img.convert('RGB')
    img = pad_to(img, size) if fit == 'pad' else ImageOps.fit(img, size, Image.LANCZOS, centering=centering)
    path = os.path.join(ROOT, 'public', out)
    if out.endswith('.webp'):
        img.save(path, 'WEBP', quality=90, method=6)
    else:
        img.save(path, optimize=True)
    return path


def run_job(group, job):
    raw_dir = os.path.join(RAW, group)
    os.makedirs(raw_dir, exist_ok=True)
    raw_path = os.path.join(raw_dir, f"{job['name']}.png")
    if RECROP:
        img = Image.open(raw_path)
    else:
        refs = [os.path.join(raw_dir, f'{r}.png') for r in job.get('refs', [])]
        data, _ = generate_image(job['prompt'], aspect=job['aspect'], size=job.get('imageSize', '2K'), refs=refs)
        img = Image.open(io.BytesIO(data))
        img.save(raw_path)
    if job.get('out'):
        save_final(img, job['out'], job['size'], job.get('centering', DEFAULT_CENTERING.get(job['size'], (0.5, 0.5))), 'pad' if job['size'] == SMALL else 'crop')
    return job['name'], img.size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('group')
    ap.add_argument('--only', default='')
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--recrop', action='store_true')
    args = ap.parse_args()

    jobs = GROUPS[args.group]
    only = {x for x in args.only.split(',') if x}
    pending = [j for j in jobs if not only or j['name'] in only]
    names = {j['name'] for j in pending}
    done = set()
    # Run in waves: a job waits until the reference images it needs from this run exist.
    while pending:
        wave = [j for j in pending if not (names - done).intersection(j.get('refs', []))]
        if not wave:
            raise SystemExit(f"unresolvable refs: {[j['name'] for j in pending]}")
        with ThreadPoolExecutor(args.workers) as pool:
            futures = {pool.submit(run_job, args.group, j): j['name'] for j in wave}
            for fut, name in futures.items():
                try:
                    n, size = fut.result()
                    print(f'ok   {n} {size[0]}x{size[1]}', flush=True)
                except Exception as e:  # keep going; report failures and let dependants skip
                    print(f'FAIL {name}: {e}', flush=True)
                done.add(name)
        pending = [j for j in pending if j not in wave]


if __name__ == '__main__':
    main()
