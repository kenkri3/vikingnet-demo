# Engangsjobb: beskjærer og komprimerer Elconnects egne bilder til demoen.
import os
from PIL import Image, ImageOps

SRC = 'elconnect/img'


def last(navn):
    im = Image.open(os.path.join(SRC, navn))
    return ImageOps.exif_transpose(im).convert('RGB')


def crop(im, forhold):
    w, h = im.size
    if w / h > forhold:
        ny_w = int(h * forhold)
        x = (w - ny_w) // 2
        boks = (x, 0, x + ny_w, h)
    else:
        ny_h = int(w / forhold)
        y = (h - ny_h) // 2
        boks = (0, y, w, y + ny_h)
    return im.crop(boks)


def lagre(im, navn, bredde, kvalitet=80):
    w, h = im.size
    hoyde = int(h * bredde / w)
    im = im.resize((bredde, hoyde), Image.LANCZOS)
    sti = os.path.join(SRC, navn)
    im.save(sti, 'JPEG', quality=kvalitet, optimize=True, progressive=True)
    print(f'{navn:28} {im.size[0]}x{im.size[1]} {os.path.getsize(sti) // 1024} kB')


hero = crop(last('hovedtavle-HF1.jpg'), 4 / 5)
lagre(hero, 'hero.jpg', 1000, 78)

detalj = crop(last('underfordeling-UF1.jpg'), 3 / 4)
lagre(detalj, 'tavle-detalj.jpg', 820, 78)

prosjekter = {
    'prosjekt-nadderud.jpg': ('projects-nadderud-idrettspark.jpg', 400, None),
    'prosjekt-vision.jpg': ('projects-vision.webp', 800, 16 / 9),
    'prosjekt-campus.jpg': ('projects-campus-ulleval.avif', 800, 16 / 9),
    'prosjekt-delta.jpg': ('projects-delta.jpg', 800, 16 / 9),
    'prosjekt-radhuspassasjen.jpg': ('projects-radhuspassasjen.jpg', 800, 16 / 9),
    'prosjekt-sio.jpg': ('projects-sio-studentbolig.webp', 800, 16 / 9),
}
for ut, (inn, bredde, forhold) in prosjekter.items():
    im = last(inn)
    if forhold:
        im = crop(im, forhold)
    lagre(im, ut, bredde, 76)

print('ferdig')

