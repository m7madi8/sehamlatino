from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HP = ROOT.parent / "seham-homepage-full"

for base in (ROOT, HP):
    for p in base.rglob("*.html"):
        t = p.read_text(encoding="utf-8")
        t2 = re.sub(r"studio\.css\?v=[^\"']+", "studio.css?v=wine-deep", t)
        if t2 != t:
            p.write_text(t2, encoding="utf-8")

src = (ROOT / "studio.css").read_text(encoding="utf-8")
dst_p = HP / "studio.css"
dst = dst_p.read_text(encoding="utf-8")
s0 = ":root {"
i0 = src.index(s0)
i1 = src.index("}", i0)
block = src[i0 : i1 + 1]
d0 = dst.index(s0)
d1 = dst.index("}", d0)
dst = dst[:d0] + block + dst[d1 + 1 :]
dst_p.write_text(dst, encoding="utf-8")
print("bumped + synced :root")