import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = (root / "seham-loader-handwritten.html").read_text(encoding="utf-8")

m = re.search(r"<style>(.*?)</style>", html, re.DOTALL)
css = m.group(1).strip() if m else ""

for strip in (
    "body{margin:0;background:var(--ivory);font-family:Arial,sans-serif}",
    ".stage{min-height:100vh;display:grid;place-items:center;color:#795f60;font-size:11px;letter-spacing:.23em;text-transform:uppercase}",
    ".dev{position:fixed;bottom:20px;right:20px;z-index:60;border:1px solid #cbb9aa;background:var(--ivory);color:var(--ink);border-radius:999px;padding:10px 18px;cursor:pointer}",
    ".playing .dev{visibility:hidden}",
    "*{box-sizing:border-box}",
):
    css = css.replace(strip, "")

css = css.replace("z-index:50", "z-index:9999")
css = css.replace("pointer-events:none", "pointer-events:auto;touch-action:none")

intro = re.search(
    r'<div id="intro"[^>]*>.*?</div>\s*</div>\s*(?=<button|$)',
    html,
    re.DOTALL,
)
if not intro:
    raise SystemExit("intro block not found")
frag = intro.group(0).strip()
(root / "preloader-fragment.html").write_text(frag + "\n", encoding="utf-8")

css_out = (
    "/* Seham Latino — handwritten signature preloader (homepage) */\n"
    "html.is-preloading,\nhtml.is-preloading body {\n"
    "  overflow: hidden;\n  height: 100%;\n}\n\n"
    + css
    + "\n\n#intro[hidden] {\n  display: none !important;\n}\n"
)
(root / "preloader.css").write_text(css_out, encoding="utf-8")
print("fragment", len(frag), "css", len(css_out))