"""Turn the white-on-black emblems into white-with-alpha PNGs (used as CSS masks on the badges)."""
import os

from PIL import Image

RAW = os.path.join(os.path.dirname(__file__), 'raw', 'emblems')

for name in ('aurelia', 'corvex', 'lumora'):
    lum = Image.open(os.path.join(RAW, f'{name}.png')).convert('L')
    lum = lum.point(lambda v: 0 if v < 40 else (255 if v > 215 else int((v - 40) * 255 / 175)))
    lum = lum.crop(lum.getbbox())
    side = max(lum.size)
    square = Image.new('L', (side, side), 0)
    square.paste(lum, ((side - lum.width) // 2, (side - lum.height) // 2))
    out = Image.new('RGBA', square.size, (255, 255, 255, 0))
    out.putalpha(square)
    out.save(os.path.join(RAW, f'{name}-alpha.png'))
    print('ok  ', name, square.size)
