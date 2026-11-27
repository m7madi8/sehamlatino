"""Extract sl-course-v2 CSS from preview HTML into course-v2.css."""
from __future__ import annotations

import re
from pathlib import Path

PREVIEW = Path(r"c:\Users\eslam\Downloads\seham-course-refined-preview.html")
OUT_CSS = Path(__file__).resolve().parents[1] / "course-v2.css"

text = PREVIEW.read_text(encoding="utf-8")
marker = "/* Seham Latino | Course editorial"
start = text.find("<style>\n" + marker)
if start < 0:
    start = text.find(marker)
    if start < 0:
        raise SystemExit("v2 CSS block not found")
    # find opening style before marker
    start = text.rfind("<style>", 0, start)
end = text.find("</style>", start)
css = text[start + len("<style>") : end].strip()
OUT_CSS.write_text(css + "\n", encoding="utf-8")
print(f"Wrote {OUT_CSS} ({len(css)} chars)")