#!/usr/bin/env python3
"""Phase 02: generate responsive WebP derivatives (no upscaling)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "img"

Image.MAX_IMAGE_PIXELS = None  # allow large source photo


def encode_webp(img: Image.Image, out: Path, quality: int) -> int:
    img.save(out, format="WEBP", quality=quality, method=6)
    return out.stat().st_size


def resize_to_width(src: Image.Image, target_w: int) -> Image.Image:
    w, h = src.size
    if target_w >= w:
        return src.copy()
    target_h = round(h * target_w / w)
    return src.resize((target_w, target_h), Image.Resampling.LANCZOS)


def course_hero() -> None:
    src_path = IMG / "dscf9871-hero.jpg"
    if not src_path.is_file():
        print("skip course hero:", src_path)
        return
    print("opening course hero (large)…", flush=True)
    with Image.open(src_path) as im:
        im.load()
        im = ImageOps_exif(im)
        w, h = im.size
        print(f"  source {w}x{h}")
        widths = [640, 960, 1440, 1920]
        for tw in widths:
            if tw > w:
                continue
            out = IMG / f"dscf9871-hero-{tw}.webp"
            ri = resize_to_width(im, tw)
            for q in (88, 84, 80, 76, 72):
                nbytes = encode_webp(ri, out, q)
                if nbytes <= 450_000 or tw < 1920:
                    if tw == 1920 and nbytes > 450_000:
                        pass  # best effort at q
                    break
            print(f"  {out.name}: {out.stat().st_size:,} bytes @ q≈{q}")


def ImageOps_exif(im: Image.Image) -> Image.Image:
    try:
        from PIL import ImageOps

        return ImageOps.exif_transpose(im)
    except Exception:
        return im


def hero_phone() -> None:
    src_path = IMG / "hero-phone.png"
    if not src_path.is_file():
        print("skip hero phone:", src_path)
        return
    with Image.open(src_path) as im:
        im.load()
        w, h = im.size
        print(f"hero-phone source {w}x{h}")
        widths = [480, 720, 941]
        for tw in widths:
            if tw > w:
                tw = w
            out = IMG / f"hero-phone-{tw}.webp"
            ri = resize_to_width(im, tw)
            for q in (88, 85, 82, 78, 74, 70):
                nbytes = encode_webp(ri, out, q)
                if nbytes <= 250_000 or tw < 941:
                    break
            print(f"  {out.name}: {out.stat().st_size:,} bytes")


def extract_footer_silk() -> Path:
    css_path = ROOT / "studio.css"
    text = css_path.read_text(encoding="utf-8")
    m = re.search(
        r"url\('data:image/webp;base64,([^']+)'\)",
        text,
    )
    if not m:
        raise SystemExit("footer silk base64 not found")
    import base64

    data = base64.b64decode(m.group(1))
    out = IMG / "sl-footer-silk.webp"
    out.write_bytes(data)
    print(f"footer silk extracted: {out.stat().st_size:,} bytes")
    return out


def dedupe_footer_silk_urls() -> None:
    css_path = ROOT / "studio.css"
    text = css_path.read_text(encoding="utf-8")
    before = len(text)
    pattern = re.compile(
        r"url\('data:image/webp;base64,[^']+'\)",
    )
    replacement = 'url("img/footer/sl-footer-silk.webp")'
    text2, n = pattern.subn(replacement, text)
    css_path.write_text(text2, encoding="utf-8")
    after = len(text2)
    print(f"studio.css: {before:,} -> {after:,} bytes ({n} replacements)")


def main() -> int:
    course_hero()
    hero_phone()
    extract_footer_silk()
    dedupe_footer_silk_urls()
    return 0


if __name__ == "__main__":
    sys.exit(main())