import os
import sys

from PIL import Image

d = os.path.dirname(os.path.abspath(__file__))
for name in sys.argv[1:]:
    p = os.path.join(d, name)
    try:
        im = Image.open(p)
        print(name, im.size, im.mode)
        base = name.rsplit('.', 1)[0]
        out = os.path.join(d, base.replace('-raw', '') + '.jpg')
        im.convert('RGB').save(out, 'JPEG', quality=82)
        print('  ->', os.path.basename(out), round(os.path.getsize(out) / 1024), 'kB')
    except Exception as exc:  # noqa: BLE001
        print(name, 'FAIL', exc)
