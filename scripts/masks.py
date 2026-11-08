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
OVERRIDES = {
    "next/hdfc.png": [(1151, 240, 1700, 757, 40)],
    # the faint document pages floating either side of the assistant
    "adeo/assistant.png": [(x0, 805, x1, 1316, 12) for x0, x1 in [(-20, 322), (346, 759), (782, 1202), (1226, 1639), (1662, 1912), (2698, 2948), (2971, 3360)]],
}


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
    forced = np.zeros_like(prod)
    for x0, y0, x1, y1, r in OVERRIDES.get(os.path.relpath(path, os.path.join(ROOT, "public/images")), []):
        yy, xx = np.mgrid[0:gh, 0:gw] * BLOCK
        cx = np.clip(xx, x0 + r, x1 - r)
        cy = np.clip(yy, y0 + r, y1 - r)
        forced |= (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1) & (np.hypot(xx - cx, yy - cy) <= r)
    prod |= forced
    cover = float(prod.mean())

    # Exact cut, pixel by pixel. A model of the painted ground alone is made (its colour block by block, smoothed, and
    # carried in under the product), and every pixel is compared with it: what differs from the ground by more than the
    # paint's own grain is product. So strokes, borders, rounded corners, text and icons on the ground, and the soft drop
    # shadows, are all kept exactly as they were made; only the bare painted ground is given over to the moving wash.
    known = (reach & ~dilate(prod, 1)).astype(np.float32)
    means = im[: gh * BLOCK, : gw * BLOCK].reshape(gh, BLOCK, gw, BLOCK, 3).mean(axis=(1, 3))

    def box(a, r):
        c = np.cumsum(np.cumsum(np.pad(a, ((r + 1, r), (r + 1, r)) + ((0, 0),) * (a.ndim - 2), mode="edge"), 0), 1)
        return c[2 * r + 1:, 2 * r + 1:] - c[: -2 * r - 1, 2 * r + 1:] - c[2 * r + 1:, : -2 * r - 1] + c[: -2 * r - 1, : -2 * r - 1]

    model = np.zeros_like(means)
    have = np.zeros((gh, gw), bool)
    for r in (3, 10, 30, 90):
        wsum = box(known, r)
        est = box(means * known[..., None], r) / np.maximum(wsum, 1e-6)[..., None]
        fill = (wsum > 0.5) & ~have
        model[fill] = est[fill]
        have |= fill
    model[~have] = np.median(means[known > 0], axis=0)
    gimg = Image.fromarray((np.clip(model, 0, 1) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(BLOCK * 2))
    gnd = np.asarray(gimg).astype(np.float32) / 255
    soft = np.asarray(Image.open(path).convert("RGB").filter(ImageFilter.GaussianBlur(1.1))).astype(np.float32) / 255
    diff = np.abs(soft - gnd).max(axis=-1)

    up = lambda a: np.pad(np.repeat(np.repeat(a, BLOCK, 0), BLOCK, 1), ((0, h - gh * BLOCK), (0, w - gw * BLOCK)), mode="edge")
    far = up(known > 0) & ~up(dilate(prod, 8))
    sig = float(np.percentile(diff[far], 90)) if far.any() else 0.03
    P = np.clip((diff - sig * 1.25) / (sig * 1.6), 0, 1)
    P = P * P * (3 - 2 * P)
    # the soft drop shadows: darker than the ground, but gently, so they are found on a smoother copy where the grain is gone
    lumw = np.array([0.299, 0.587, 0.114], np.float32)
    blur4 = np.asarray(Image.open(path).convert("RGB").filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
    dark = (gnd @ lumw) - (blur4 @ lumw)
    sd = float(np.percentile(np.abs(dark[far]), 90)) if far.any() else 0.01
    S = np.clip((dark - sd * 1.2) / (sd * 2.5), 0, 1)
    P = np.maximum(P, S * S * (3 - 2 * S))
    # what is really there, judged in blocks: a block counts when a good part of it differs from the ground (the paint's grain
    # never does); anything those blocks enclose is product too (the text inside a page, the body of a translucent card)
    bp = (P[: gh * BLOCK, : gw * BLOCK] > 0.5).reshape(gh, BLOCK, gw, BLOCK).mean(axis=(1, 3)) > 0.12
    bp = erode(dilate(bp, 3), 3) | forced  # bridges small gaps in an outline, so what it holds is found
    open_ = ~bp
    r2 = np.zeros_like(open_)
    r2[0, :], r2[-1, :], r2[:, 0], r2[:, -1] = open_[0, :], open_[-1, :], open_[:, 0], open_[:, -1]
    while True:
        nx = dilate(r2, 1) & open_
        if (nx == r2).all():
            break
        r2 = nx
    holes = ~r2 & ~bp
    P *= up(dilate(bp | holes, 2))
    inner = up(erode(holes, 1) | erode((prod & ~g) | forced, 2))
    P = np.maximum(P, inner.astype(np.float32))
    m = Image.fromarray((P * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    m = m.resize((w // 2, h // 2), Image.LANCZOS)
    # the ground's own colour, so the wash is painted in it and meets the kept margin without a seam
    gm = np.median(im[: gh * BLOCK, : gw * BLOCK].reshape(gh, BLOCK, gw, BLOCK, 3).transpose(0, 2, 1, 3, 4)[reach & ~dilate(prod, 4)].reshape(-1, 3), axis=0)
    return m, cover, [round(float(v) * 255) for v in gm]


VERSION = __import__("time").strftime("%y%m%d%H%M")  # a new address each time the masks are made, so no browser keeps an old one


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
            report["/images/" + rel] = {"cover": round(cover, 3), "ground": ground, "v": VERSION}
            print(rel, round(cover, 3))
    with open(os.path.join(ROOT, "content/masks.json"), "w") as fh:
        json.dump(report, fh, indent=1)


if __name__ == "__main__":
    main()
