# -*- coding: utf-8 -*-
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "img" / "seham-logo.png"
OUT = ROOT / "img" / "seham-logo-champagne.png"


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    arr = np.array(im)
    mx = arr[:, :, :3].max(axis=2)
    arr[:, :, 3] = np.where(mx > 38, 255, 0).astype(np.uint8)
    Image.fromarray(arr).save(OUT, optimize=True)
    print("Wrote", OUT)


if __name__ == "__main__":
    main()