#!/usr/bin/env python3
"""
Collage generator for AVM Masiyer Bokkos tour cover image.

Usage:
  1. Place your 5 photos in a folder (e.g. ./tour_photos/)
  2. Run:  python3 make_collage.py
  3. Output: assets/img/news/avm-masiyer-bokkos-consultation-tour-april-2026.jpg
"""

from PIL import Image, ImageDraw
import os, sys, glob

# ── Config ────────────────────────────────────────────────────────────────────
INPUT_FOLDER   = "tour_photos"       # folder containing the 5 source photos
OUTPUT_PATH    = "assets/img/news/avm-masiyer-bokkos-consultation-tour-april-2026.jpg"
CANVAS_W       = 1200                # final width  (px)
CANVAS_H       = 750                 # final height (px)
GAP            = 6                   # gap between photos (px)
BG_COLOR       = (20, 20, 20)        # near-black background
JPEG_QUALITY   = 90
# ──────────────────────────────────────────────────────────────────────────────

def crop_to_ratio(img, w, h):
    """Centre-crop img to the target aspect ratio w:h."""
    target_ratio = w / h
    src_w, src_h = img.size
    src_ratio    = src_w / src_h

    if src_ratio > target_ratio:          # source is wider — crop sides
        new_w = int(src_h * target_ratio)
        left  = (src_w - new_w) // 2
        img   = img.crop((left, 0, left + new_w, src_h))
    else:                                 # source is taller — crop top/bottom
        new_h = int(src_w / target_ratio)
        top   = (src_h - new_h) // 2
        img   = img.crop((0, top, src_w, top + new_h))

    return img.resize((w, h), Image.LANCZOS)


def make_collage(photos):
    """
    Layout (5 photos):

        ┌──────────┬──────────┐
        │    1     │    2     │  top row  — 50 / 50 split, 55 % of canvas height
        ├───┬───┬──┴──────────┤
        │ 3 │ 4 │      5     │  bottom row — thirds, 45 % of canvas height
        └───┴───┴─────────────┘
    """
    canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), BG_COLOR)

    top_h = int(CANVAS_H * 0.55)
    bot_h = CANVAS_H - top_h - GAP

    # ── Top row (2 photos, equal width) ──────────────────────────────────────
    half_w = (CANVAS_W - GAP) // 2

    img1 = crop_to_ratio(photos[0], half_w, top_h)
    img2 = crop_to_ratio(photos[1], CANVAS_W - half_w - GAP, top_h)

    canvas.paste(img1, (0, 0))
    canvas.paste(img2, (half_w + GAP, 0))

    # ── Bottom row (3 photos: two equal thirds + one wider third) ────────────
    y = top_h + GAP

    third_w = (CANVAS_W - 2 * GAP) // 3
    wider_w = CANVAS_W - 2 * third_w - 2 * GAP   # absorbs rounding remainder

    img3 = crop_to_ratio(photos[2], third_w, bot_h)
    img4 = crop_to_ratio(photos[3], third_w, bot_h)
    img5 = crop_to_ratio(photos[4], wider_w, bot_h)

    canvas.paste(img3, (0, y))
    canvas.paste(img4, (third_w + GAP, y))
    canvas.paste(img5, (2 * third_w + 2 * GAP, y))

    return canvas


def main():
    # Collect source images
    exts   = ("*.jpg", "*.jpeg", "*.JPG", "*.JPEG", "*.png", "*.PNG")
    photos = []
    for ext in exts:
        photos.extend(sorted(glob.glob(os.path.join(INPUT_FOLDER, ext))))

    if len(photos) < 5:
        sys.exit(
            f"Need 5 images in '{INPUT_FOLDER}/', found {len(photos)}.\n"
            "Rename them 1.jpg … 5.jpg (or any extension) in the order you want them to appear."
        )

    photos = photos[:5]
    print("Using photos:")
    for i, p in enumerate(photos, 1):
        print(f"  [{i}] {p}")

    imgs   = [Image.open(p).convert("RGB") for p in photos]
    result = make_collage(imgs)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    result.save(OUTPUT_PATH, "JPEG", quality=JPEG_QUALITY)
    print(f"\nCollage saved → {OUTPUT_PATH}")
    print(f"Size: {result.size[0]} × {result.size[1]} px")


if __name__ == "__main__":
    main()
