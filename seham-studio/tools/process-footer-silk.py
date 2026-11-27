# -*- coding: utf-8 -*-
"""Strip baked-in checkerboard from menu-silk-texture.jpg → transparent WebP/PNG."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import binary_closing, binary_dilation

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "img" / "menu-silk-texture.jpg"
OUT_WEBP = ROOT / "img" / "footer-silk-fabric.webp"
OUT_PNG = ROOT / "img" / "footer-silk-fabric.png"
VERIFY = ROOT / "img" / "footer-silk-verify-on-burgundy.png"
BG = (0x3B, 0x0C, 0x18)


def is_neutral(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    return (np.abs(r - g) < 11) & (np.abs(g - b) < 11) & (np.abs(r - b) < 13)


def checker_alpha(rgb: np.ndarray) -> np.ndarray:
    r = rgb[:, :, 0].astype(np.float32)
    g = rgb[:, :, 1].astype(np.float32)
    b = rgb[:, :, 2].astype(np.float32)
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    chroma = mx - mn
    neutral = is_neutral(r, g, b)

    fabric_core = (chroma >= 24) & (r >= g - 4) & (r >= b - 10)
    fabric_core |= chroma >= 38

    # Expand slightly to keep fold antialiasing — then clip neutral
    fabric = binary_dilation(fabric_core, iterations=2)
    fabric = binary_closing(fabric, structure=np.ones((3, 3)))

    alpha = np.zeros(r.shape, dtype=np.float32)
    alpha[fabric_core] = 255.0

    fringe = fabric & ~fabric_core
    fringe = fringe & ~neutral & (chroma >= 14)
    alpha[fringe] = np.clip((chroma[fringe] - 10) * 12, 0, 220)

    # Never keep neutral pixels (checker)
    alpha[neutral & (chroma < 28)] = 0

    # Highlights on fabric — slightly restrained
    alpha[fabric_core & (mx > 215)] *= 0.78

    alpha[~fabric] = 0
    return np.clip(alpha, 0, 255).astype(np.uint8)


def audit_checker(rgb: np.ndarray, alpha: np.ndarray) -> float:
    """Fraction of visible pixels that still look like checker gray."""
    show = alpha > 40
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    mx = np.maximum(np.maximum(r, g), b)
    chroma = mx - np.minimum(np.minimum(r, g), b)
    neutral = is_neutral(r, g, b) & show & (chroma < 22)
    return neutral.sum() / max(show.sum(), 1)


def verify_on_burgundy(rgba: Image.Image) -> None:
    bg = Image.new("RGB", rgba.size, BG)
    bg.paste(rgba, mask=rgba.split()[3])
    bg.save(VERIFY, quality=92)


def main() -> None:
    im = Image.open(SRC).convert("RGB")
    arr = np.array(im)
    alpha = checker_alpha(arr)
    audit = audit_checker(arr, alpha)
    print(f"Checker-like surviving pixels: {100 * audit:.3f}% of visible")

    rgba = Image.fromarray(np.dstack([arr, alpha]), mode="RGBA")
    # Gentle alpha soften (not hiding checker — only antialias fabric)
    a = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(radius=0.6))
    rgba.putalpha(a)
    # Re-kill neutral after blur
    alpha2 = np.array(a)
    rgb = arr
    neutral = is_neutral(rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2])
    chroma = np.max(rgb, 2) - np.min(rgb, 2)
    alpha2[neutral & (chroma < 26)] = 0
    rgba.putalpha(Image.fromarray(alpha2))

    rgba.save(OUT_PNG, optimize=True)
    rgba.save(OUT_WEBP, quality=90, method=6)
    verify_on_burgundy(rgba)
    print(f"Saved {OUT_WEBP.name} — visible {100 * (alpha2 > 32).sum() / alpha2.size:.1f}%")


if __name__ == "__main__":
    main()