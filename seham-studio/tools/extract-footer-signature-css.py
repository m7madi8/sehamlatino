# -*- coding: utf-8 -*-
"""Extract .sl-footer CSS from seham-footer-preview-ar.html."""
from __future__ import annotations

import re
from pathlib import Path

PREVIEW = Path(r"c:\Users\eslam\Downloads\seham-footer-preview-ar.html")
OUT = Path(__file__).resolve().parents[1] / "footer-signature.css"


def main() -> None:
    text = PREVIEW.read_text(encoding="utf-8")
    m = re.search(r"/\* Seham Latino — Signature Closing.*", text, re.S)
    if not m:
        raise SystemExit("CSS block not found in preview")
    css = m.group(0).split("</style>", 1)[0].strip()
    css = re.sub(
        r"background:url\('data:image/webp;base64,[^']+'\)",
        "background:url('img/ui/menu-silk-texture.jpg')",
        css,
    )
    OUT.write_text(css + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()