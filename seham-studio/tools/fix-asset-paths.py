from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
IMG_FIX = {
    "hero-phone-720.webp": "hero/hero-phone-720.webp",
    "sl-footer-silk.webp": "footer/sl-footer-silk.webp",
}

for path in ROOT.rglob("*"):
    if path.suffix not in {".html", ".css", ".js", ".md", ".json"}:
        continue
    if "vendor" in path.parts:
        continue
    try:
        t = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        continue
    n = t
    if "css" in path.parts:
        n = re.sub(r'url\((["\'])img/', r"url(\1../img/", n)
    for a, b in IMG_FIX.items():
        n = n.replace(f"img/{a}", f"img/{b}")
    if path.name == "studio.js" and "siteRootFromScript" not in n:
        n = n.replace(
            "(function () {",
            """(function () {
  function siteRootFromScript(src) {
    const base = src.replace(/studio\\.js.*$/, "");
    return /\\/js\\/$/.test(base) || base.endsWith("js/") ? base.replace(/js\\/$/, "") : base;
  }""",
            1,
        )
        n = n.replace(
            'loader.src = studioSrc.replace(/studio\\.js.*$/, "vendor/lenis.min.js");',
            'loader.src = siteRootFromScript(studioSrc) + "vendor/lenis.min.js";',
        )
        n = re.sub(
            r'const base = studioSrc\.replace\(/studio\.js\[^/\]\*\$/, ""\);',
            "const base = siteRootFromScript(studioSrc);",
            n,
        )
        n = n.replace(
            'css.href = base + "seham-motion.css?v=rhythm-3.1";',
            'css.href = base + "css/seham-motion.css?v=rhythm-3.1";',
        )
        n = n.replace(
            'motion.src = base + "seham-motion.js?v=rhythm-3.1";',
            'motion.src = base + "js/seham-motion.js?v=rhythm-3.1";',
        )
    if n != t:
        path.write_text(n, encoding="utf-8")
        print(path.relative_to(ROOT))