import os

from PIL import Image

d = os.path.dirname(os.path.abspath(__file__))


def save(im, name, width, quality=80):
    if im.width > width:
        h = round(im.height * width / im.width)
        im = im.resize((width, h), Image.LANCZOS)
    out = os.path.join(d, name)
    im.convert("RGB").save(out, "JPEG", quality=quality, optimize=True, progressive=True)
    print(f"{name}: {im.width}x{im.height} {os.path.getsize(out) / 1024:.0f} kB")


save(Image.open(os.path.join(d, "simplify.jpg")), "forenkle.jpg", 1400, 78)
save(Image.open(os.path.join(d, "unify.jpg")), "samle.jpg", 1400, 78)
save(Image.open(os.path.join(d, "drive.jpg")), "effekt.jpg", 1400, 78)
save(Image.open(os.path.join(d, "kontor.jpg")), "kontor.jpg", 1100, 80)
save(Image.open(os.path.join(d, "oslo.jpg")), "oslo.jpg", 900, 78)

# OG-bilde 1200x630 fra «samle»-motivet, beskåret midt i bildet.
og = Image.open(os.path.join(d, "unify.jpg")).convert("RGB")
w, h = og.size
target_ratio = 1200 / 630
crop_w = w
crop_h = round(w / target_ratio)
if crop_h > h:
    crop_h = h
    crop_w = round(h * target_ratio)
left = (w - crop_w) // 2
top = (h - crop_h) // 2
og = og.crop((left, top, left + crop_w, top + crop_h)).resize((1200, 630), Image.LANCZOS)
out = os.path.join(d, "og.jpg")
og.save(out, "JPEG", quality=82, optimize=True, progressive=True)
print(f"og.jpg: 1200x630 {os.path.getsize(out) / 1024:.0f} kB")
