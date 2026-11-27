# -*- coding: utf-8 -*-
"""Import footer CSS + logo from سص.html (exact reference)."""
from __future__ import annotations

import base64
import re
from pathlib import Path

SASS = Path(r"c:\Users\eslam\Downloads\سص.html")
ROOT = Path(__file__).resolve().parents[1]
OUT_CSS = ROOT / "footer-signature.css"
LOGO_OUT = ROOT / "img" / "seham-footer-logo-gold.png"
STUDIO = ROOT / "studio.css"
MARKER = "/* Seham Latino — Signature footer"


def main() -> None:
    text = SASS.read_text(encoding="utf-8")

    m_css = re.search(
        r"<style>/\* Seham Latino — Signature Closing.*?</style>",
        text,
        re.S,
    )
    m_refine = re.search(
        r"<style>/\* Final refinements.*?</style>",
        text,
        re.S,
    )
    if not m_css:
        raise SystemExit("Main footer CSS not found in سص.html")

    css_main = m_css.group(0)
    css_main = re.sub(r"^<style>", "", css_main)
    css_main = re.sub(r"</style>$", "", css_main).strip()

    css_refine = ""
    if m_refine:
        css_refine = m_refine.group(0)
        css_refine = re.sub(r"^<style>", "", css_refine)
        css_refine = re.sub(r"</style>$", "", css_refine).strip()

    combined = css_main + "\n\n" + css_refine + "\n"
    OUT_CSS.write_text(combined, encoding="utf-8")

    m_logo = re.search(
        r'<img class="sl-footer__logo" src="(data:image/png;base64,[^"]+)"',
        text,
    )
    if m_logo:
        b64 = m_logo.group(1).split(",", 1)[1]
        LOGO_OUT.write_bytes(base64.b64decode(b64))
        print("Logo:", LOGO_OUT)

    studio = STUDIO.read_text(encoding="utf-8")
    if MARKER in studio:
        studio = studio.split(MARKER, 1)[0].rstrip() + "\n\n" + combined
    else:
        # drop old signature block if present
        old = "/* --- Signature footer"
        if old in studio:
            studio = studio.split(old, 1)[0].rstrip()
        studio = studio + "\n\n" + combined
    STUDIO.write_text(studio, encoding="utf-8")
    print("Wrote", OUT_CSS, "and merged into studio.css")


if __name__ == "__main__":
    main()