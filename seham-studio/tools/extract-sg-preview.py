import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
for name in ["preview-ar.html", "preview-en.html"]:
    s = (root / name).read_text(encoding="utf-8")
    m = re.search(r"<style>(.*?)</style>", s, re.DOTALL)
    css = m.group(1) if m else ""
    (root / f"sg-gift-extracted-{name[8:10]}.css").write_text(css, encoding="utf-8")
    body = re.search(r"<body>(.*?)</body>", s, re.DOTALL)
    if body:
        html = body.group(1)
        silk_m = re.search(
            r'class="sg-silk" src="data:image/svg\+xml;base64,([^"]+)"', s
        )
        if silk_m:
            import base64

            svg = base64.b64decode(silk_m.group(1)).decode("utf-8")
            silk_path = root / "assets" / "decorative" / "seham-gift-silk.svg"
            silk_path.parent.mkdir(parents=True, exist_ok=True)
            silk_path.write_text(svg, encoding="utf-8")
        html = re.sub(
            r'(<div class="sg-photo"><img )src="data:image/jpeg;base64,[^"]+"',
            r'\1src="img/gift-cover.jpg"',
            html,
        )
        html = re.sub(
            r'class="sg-silk" src="data:image/svg\+xml;base64,[^"]+"',
            'class="sg-silk" src="assets/decorative/seham-gift-silk.svg"',
            html,
        )
        (root / f"sg-gift-extracted-{name[8:10]}.html").write_text(html.strip(), encoding="utf-8")
    print(name, "css", len(css), "html", len(html if body else 0))