import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
frag = (root / "preloader-fragment.html").read_text(encoding="utf-8").strip()
frag = frag.replace(
    '<div id="intro" aria-hidden="true">',
    '<div id="intro" aria-hidden="true" hidden>',
    1,
)

for rel in ("index.html", "en/index.html"):
    path = root / rel
    text = path.read_text(encoding="utf-8")
    text, n = re.subn(
        r'<div id="intro"[^>]*>.*?</template>\s*</div>\s*</div>|'
        r'<div id="intro"[^>]*><div class="curtain">.*?</div>\s*</div>',
        frag,
        text,
        count=1,
        flags=re.DOTALL,
    )
    if n != 1:
        text, n = re.subn(
            r'<div id="intro"[^>]*>.*?</svg></div></div>',
            frag,
            text,
            count=1,
            flags=re.DOTALL,
        )
    if n != 1:
        raise SystemExit(f"Could not replace intro in {rel}")
    text = text.replace("preloader.css?v=logo-mask-1", "preloader.css?v=handwritten-signature")
    text = text.replace("preloader.js?v=logo-mask-1", "preloader.js?v=handwritten-signature")
    text = re.sub(r'\s*<script defer src="(?:\.\./)?vendor/gsap\.min\.js"></script>\s*', "\n", text)
    text = text.replace(
        'content="#f6eee6" name="theme-color"',
        'content="#2A0710" name="theme-color"',
        1,
    )
    path.write_text(text, encoding="utf-8")
    print("updated", rel)