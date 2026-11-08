"""
Masks for the moving backgrounds: for every case study image, which part is the product (kept still) and which part is the
painted background (replaced by the moving watercolour wash in the page).

The painted background is one tinted colour family; the product screenshots are neutral (white, greys, near black) or
coloured differently. Each pixel is scored against the background's own colour, read from the image's border; the result
is cleaned up in blocks, and every bit of "background" that cannot be reached from the border (a tinted chart inside a
screenshot, say) is counted as product. The mask is saved at a quarter of the size, white = product.

Run: python3 scripts/masks.py   (needs Pillow and numpy)
"""

import glob
import json
import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public/images/_mask")
FOLDERS = ["adeo", "ai-agent", "enterprise-search", "hdfc", "sony", "home", "next"]
SKIP = {"closing.png"}  # the closing paintings already move whole: they sit under the wash at the foot of each case
BLOCK = 4
# product the colour test cannot tell from the ground (a translucent card tinted like it): rounded rectangles, in pixels
OVERRIDES = {"next/hdfc.png": [(1151, 240, 1700, 757, 40)]}


def shift(a, dy, dx):
    out = np.zeros_like(a)
    h, w = a.shape
    out[max(0, dy):h + min(0, dy), max(0, dx):w + min(0, dx)] = a[max(0, -dy):h + min(0, -dy), max(0, -dx):w + min(0, -dx)]
    return out


def dilate(a, r=1):
    o = a.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            o |= shift(a, dy, dx)
    return o


def erode(a, r=1):
    return ~dilate(~a, r)


def mask_for(path):
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255
    h, w, _ = im.shape
    lum = im @ np.array([0.299, 0.587, 0.114], np.float32)
    chroma = im - lum[..., None]

    # the background's colour, from a band round the border
    b = max(8, min(h, w) // 40)
    band = np.concatenate([im[:b].reshape(-1, 3), im[-b:].reshape(-1, 3), im[:, :b].reshape(-1, 3), im[:, -b:].reshape(-1, 3)])
    bl = band @ np.array([0.299, 0.587, 0.114], np.float32)
    bc = band - bl[:, None]
    c_bg = np.median(bc, axis=0)
    cn = np.linalg.norm(c_bg) + 1e-6
    lo, hi = np.percentile(bl, 1) - 0.08, np.percentile(bl, 99) + 0.06

    # how much a pixel looks like the painted ground: its tint lies along the ground's tint, and it is as light as the ground
    proj = (chroma @ (c_bg / cn)) / cn  # 1 = as tinted as the ground
    perp = np.linalg.norm(chroma - (chroma @ (c_bg / cn))[..., None] * (c_bg / cn), axis=-1)
    ground = (proj > 0.45) & (proj < 2.2) & (perp < 0.05 + 0.5 * cn) & (lum > lo) & (lum < hi)

    # in blocks, so the grain of the paint does not matter
    gh, gw = h // BLOCK, w // BLOCK
    g = ground[: gh * BLOCK, : gw * BLOCK].reshape(gh, BLOCK, gw, BLOCK).mean(axis=(1, 3)) > 0.5
    # the painted ground is grainy; product surfaces are smooth, even when they are tinted like the ground
    L = lum[: gh * BLOCK, : gw * BLOCK].reshape(gh, BLOCK, gw, BLOCK)
    sd = L.std(axis=(1, 3))
    edge = np.zeros_like(sd, bool)
    k = max(2, min(gh, gw) // 40)
    edge[:k], edge[-k:], edge[:, :k], edge[:, -k:] = True, True, True, True
    grain = np.median(sd[edge & g]) if (edge & g).any() else 0.0
    if grain > 0.006:
        g &= sd > grain * 0.45
    ui = ~g
    ui = dilate(erode(ui, 2), 2)  # specks in the paint go
    g = ~ui
    # the ground is what can be reached from the border; anything enclosed is product
    reach = np.zeros_like(g)
    reach[0, :] = g[0, :]
    reach[-1, :] = g[-1, :]
    reach[:, 0] = g[:, 0]
    reach[:, -1] = g[:, -1]
    while True:
        nxt = dilate(reach, 1) & g
        if (nxt == reach).all():
            break
        reach = nxt
    prod = ~reach
    prod = erode(dilate(prod, 2), 2)  # close small gaps along the product's edges
    for x0, y0, x1, y1, r in OVERRIDES.get(os.path.relpath(path, os.path.join(ROOT, "public/images")), []):
        yy, xx = np.mgrid[0:gh, 0:gw] * BLOCK
        cx = np.clip(xx, x0 + r, x1 - r)
        cy = np.clip(yy, y0 + r, y1 - r)
        prod |= (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1) & (np.hypot(xx - cx, yy - cy) <= r)
    # a margin round the product, so the moving wash never touches it: the product's own edge, corners and shadow stay
    # exactly as they were painted, and the wash fades in softly beyond them
    cover = float(prod.mean())
    prod = dilate(prod, 3)
    m = Image.fromarray((prod * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))
    # the ground's own colour, so the wash is painted in it and meets the kept margin without a seam
    gm = np.median(im[: gh * BLOCK, : gw * BLOCK].reshape(gh, BLOCK, gw, BLOCK, 3).transpose(0, 2, 1, 3, 4)[reach & ~dilate(prod, 4)].reshape(-1, 3), axis=0)
    return m, cover, [round(float(v) * 255) for v in gm]


def main():
    os.makedirs(OUT, exist_ok=True)
    report = {}
    for folder in FOLDERS:
        for f in sorted(glob.glob(os.path.join(ROOT, "public/images", folder, "*.png"))):
            if os.path.basename(f) in SKIP:
                continue
            m, cover, ground = mask_for(f)
            rel = os.path.relpath(f, os.path.join(ROOT, "public/images"))
            dst = os.path.join(OUT, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            m.save(dst, optimize=True)
            report["/images/" + rel] = {"cover": round(cover, 3), "ground": ground}
            print(rel, round(cover, 3))
    with open(os.path.join(ROOT, "content/masks.json"), "w") as fh:
        json.dump(report, fh, indent=1)


if __name__ == "__main__":
    main()
