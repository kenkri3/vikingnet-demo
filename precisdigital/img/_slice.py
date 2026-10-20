import os
import sys

from PIL import Image

src = sys.argv[1]
out_prefix = sys.argv[2]
max_h = int(sys.argv[3]) if len(sys.argv) > 3 else 2600

im = Image.open(src)
w, h = im.size
print(w, h)
n = 0
top = 0
while top < h:
    bottom = min(top + max_h, h)
    part = im.crop((0, top, w, bottom)).convert("RGB")
    out = f"{out_prefix}-{n}.jpg"
    part.save(out, "JPEG", quality=80)
    print(out, part.size, round(os.path.getsize(out) / 1024), "kB")
    n += 1
    top = bottom
