#!/usr/bin/env python3
"""Layout: css/, js/, img subfolders + reference updates."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CSS_FILES = [
    "studio.css",
    "course-v2.css",
    "about-portrait.css",
    "gift-experience.css",
    "seham-motion.css",
    "footer-signature.css",
    "preloader.css",
    "final-gesture.css",
    "editorial-story.css",
]

JS_FILES = [
    "studio.js",
    "seham-motion.js",
    "seham-perf-diag.js",
    "about-portrait.js",
    "gift-experience.js",
    "preloader.js",
]

IMG_MAP: dict[str, str] = {
    "favicon.png": "brand/favicon.png",
    "apple-touch-icon.png": "brand/apple-touch-icon.png",
    "seham-logo.png": "brand/seham-logo.png",
    "seham-logo-champagne.png": "brand/seham-logo-champagne.png",
    "seham-logo-ink.png": "brand/seham-logo-ink.png",
    "seham-logo-lockup.png": "brand/seham-logo-lockup.png",
    "seham-logo-white.png": "brand/seham-logo-white.png",
    "seham-logo-source.png": "brand/seham-logo-source.png",
    "seham-footer-logo-gold.png": "brand/seham-footer-logo-gold.png",
    "seham-signature.webp": "brand/seham-signature.webp",
    "seham-smile.png": "brand/seham-smile.png",
    "home-hero-desktop.jpg": "hero/home-hero-desktop.jpg",
    "hero-en.jpeg": "hero/hero-en.jpeg",
    "hero-phone.png": "hero/hero-phone.png",
    "hero-phone-480.webp": "hero/hero-phone-480.webp",
    "hero-phone-720.webp": "hero/hero-phone-720.webp",
    "hero-phone-941.webp": "hero/hero-phone-941.webp",
    "dscf9871-hero.jpg": "hero/dscf9871-hero.jpg",
    "dscf9871-hero-640.webp": "hero/dscf9871-hero-640.webp",
    "dscf9871-hero-960.webp": "hero/dscf9871-hero-960.webp",
    "dscf9871-hero-1440.webp": "hero/dscf9871-hero-1440.webp",
    "dscf9871-hero-1920.webp": "hero/dscf9871-hero-1920.webp",
    "course-hero-burgundy.png": "course/course-hero-burgundy.png",
    "footer-silk-fabric.png": "footer/footer-silk-fabric.png",
    "footer-silk-fabric.webp": "footer/footer-silk-fabric.webp",
    "footer-silk-verify-on-burgundy.png": "footer/footer-silk-verify-on-burgundy.png",
    "sl-footer-silk.webp": "footer/sl-footer-silk.webp",
    "menu-silk.svg": "ui/menu-silk.svg",
    "menu-silk-texture.jpg": "ui/menu-silk-texture.jpg",
    "freedom-seham.webp": "content/freedom-seham.webp",
    "gift-cover.jpg": "content/gift-cover.jpg",
    "life-coaching-cover.jpg": "content/life-coaching-cover.jpg",
    "seham-beach.jpg": "content/seham-beach.jpg",
    "seham-editorial-burgundy.jpeg": "content/seham-editorial-burgundy.jpeg",
    "sehamlatin.jpg": "content/sehamlatin.jpg",
    "sehamlatin-1.jpg": "content/sehamlatin-1.jpg",
    "DSCF9871(2).jpg": "content/DSCF9871(2).jpg",
    "Smiling Woman with Wavy Hair.png": "content/Smiling Woman with Wavy Hair.png",
    "Serene Reach in Flowing Burgundy.png": "content/Serene Reach in Flowing Burgundy.png",
    "WhatsApp Image 2026-11-26 at 8.43.58 PM.jpeg": "content/WhatsApp Image 2026-11-26 at 8.43.58 PM.jpeg",
    "AT3A8488.CR3": "_raw/AT3A8488.CR3",
    "AT3A8494.CR3": "_raw/AT3A8494.CR3",
}

SCAN_SUFFIXES = {".html", ".css", ".js", ".md", ".json", ".py"}


def patch_text(text: str) -> str:
    for css in CSS_FILES:
        text = text.replace(f'href="../{css}', f'href="../css/{css}')
        text = text.replace(f"href='../{css}", f"href='../css/{css}")
        text = re.sub(
            rf'href="{re.escape(css)}',
            f'href="css/{css}',
            text,
        )
        text = re.sub(
            rf"href='{re.escape(css)}",
            f"href='css/{css}",
            text,
        )
    for js in JS_FILES:
        text = text.replace(f'src="../{js}', f'src="../js/{js}')
        text = text.replace(f"src='../{js}", f"src='../js/{js}")
        text = re.sub(
            rf'src="{re.escape(js)}',
            f'src="js/{js}',
            text,
        )
        text = re.sub(
            rf"src='{re.escape(js)}",
            f"src='js/{js}",
            text,
        )
    for name in sorted(IMG_MAP, key=len, reverse=True):
        sub = IMG_MAP[name]
        text = text.replace(f"img/{name}", f"img/{sub}")
    return text


def patch_studio_js() -> None:
    path = ROOT / "js" / "studio.js"
    if not path.is_file():
        return
    t = path.read_text(encoding="utf-8")
    if "function siteRootFromScript" not in t:
        t = t.replace(
            "(function () {",
            """(function () {
  function siteRootFromScript(src) {
    const base = src.replace(/studio\\.js.*$/, "");
    return /\\/js\\/$/.test(base) || base.endsWith("js/") ? base.replace(/js\\/$/, "") : base;
  }""",
            1,
        )
    t = t.replace(
        'loader.src = studioSrc.replace(/studio\\.js.*$/, "vendor/lenis.min.js");',
        'loader.src = siteRootFromScript(studioSrc) + "vendor/lenis.min.js";',
    )
    t = re.sub(
        r"const base = studioSrc\.replace\(/studio\\.js\[\^/\]\*\$/, \"\"\);",
        "const base = siteRootFromScript(studioSrc);",
        t,
    )
    t = t.replace(
        'css.href = base + "seham-motion.css?v=rhythm-3.1";',
        'css.href = base + "css/seham-motion.css?v=rhythm-3.1";',
    )
    t = t.replace(
        'motion.src = base + "seham-motion.js?v=rhythm-3.1";',
        'motion.src = base + "js/seham-motion.js?v=rhythm-3.1";',
    )
    path.write_text(t, encoding="utf-8")


def move_assets() -> None:
    (ROOT / "css").mkdir(exist_ok=True)
    (ROOT / "js").mkdir(exist_ok=True)
    (ROOT / "dev").mkdir(exist_ok=True)

    for name in CSS_FILES:
        src = ROOT / name
        if src.is_file():
            shutil.move(str(src), str(ROOT / "css" / name))

    for name in JS_FILES:
        src = ROOT / name
        if src.is_file():
            shutil.move(str(src), str(ROOT / "js" / name))

    for dev in (
        "preview-ar.html",
        "preview-en.html",
        "bachataladystyle.html",
        "seham-loader-handwritten.html",
    ):
        src = ROOT / dev
        if src.is_file():
            shutil.move(str(src), str(ROOT / "dev" / dev))

    for junk in ("Untitled", "_patch_closing.py"):
        p = ROOT / junk
        if p.is_file():
            p.unlink()

    img = ROOT / "img"
    for name, sub in IMG_MAP.items():
        src = img / name
        if not src.is_file():
            continue
        dest = img / sub
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            continue
        shutil.move(str(src), str(dest))

    img_junk = img / "Untitled"
    if img_junk.is_file():
        img_junk.unlink()


def rewrite_references() -> None:
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in SCAN_SUFFIXES:
            continue
        if "node_modules" in path.parts or "vendor" in path.parts:
            continue
        if path.name == "reorganize-layout.py":
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        new = patch_text(text)
        if new != text:
            path.write_text(new, encoding="utf-8")
    repo_vercel = ROOT.parent / "vercel.json"
    if repo_vercel.is_file():
        text = repo_vercel.read_text(encoding="utf-8")
        new = patch_text(text)
        if new != text:
            repo_vercel.write_text(new, encoding="utf-8")


def main() -> None:
    import sys

    if "--rewrite-only" not in sys.argv:
        move_assets()
    rewrite_references()
    patch_studio_js()
    print("done")


if __name__ == "__main__":
    main()