"""Bump studio.css query and sync homepage-full footer CSS + logo."""
from pathlib import Path
import re
import shutil

ROOTS = [
    Path(__file__).resolve().parent.parent,
    Path(__file__).resolve().parent.parent.parent / "seham-homepage-full",
]
CACHE = "studio.css?v=sass-footer-exact"

for root in ROOTS:
    if not root.is_dir():
        continue
    for p in root.rglob("*.html"):
        if "partials" in p.parts:
            continue
        t = p.read_text(encoding="utf-8")
        n = re.sub(r'studio\.css\?v=[^"\']+', CACHE, t)
        n = re.sub(r'studio\.css"', f'{CACHE.split("?")[0]}?v=sass-footer-exact"', n)
        if "studio.css?v=" not in n and 'href="studio.css"' in n:
            n = n.replace('href="studio.css"', f'href="{CACHE}"')
        if n != t:
            p.write_text(n, encoding="utf-8", newline="\n")

studio = ROOTS[0]
css = (studio / "footer-signature.css").read_text(encoding="utf-8")
for hp in [studio / "studio.css", ROOTS[1] / "studio.css"]:
    if not hp.is_file():
        continue
    text = hp.read_text(encoding="utf-8")
    for marker in (
        "/* Seham Latino — Signature footer",
        "/* --- Signature footer",
        "/* Seham Latino - Signature footer",
    ):
        if marker in text:
            text = text.split(marker, 1)[0].rstrip() + "\n\n" + css
            break
    else:
        text = text.rstrip() + "\n\n" + css
    hp.write_text(text, encoding="utf-8")

logo_src = studio / "img" / "seham-footer-logo-gold.png"
logo_dst = ROOTS[1] / "img" / "seham-footer-logo-gold.png"
if logo_src.is_file() and logo_dst.parent.is_dir():
    shutil.copy2(logo_src, logo_dst)

print("Cache bump + sync OK")