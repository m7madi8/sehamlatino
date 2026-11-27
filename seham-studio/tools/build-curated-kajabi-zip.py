"""Build Kajabi edit pack for the curated section (طرق أخرى للتحرك معا)."""
from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT.parent / "seham-curated-kajabi"
ZIP_PATH = ROOT.parent / "seham-curated-kajabi.zip"
STUDIO_CSS = ROOT / "studio.css"

CSS_LINE_RANGES = [
    (15, 68),  # :root tokens
    (70, 74),
    (92, 99),
    (7181, 7184),  # html[dir=ltr] body
    (203, 247),
    (264, 274),
    (439, 464),
    (3613, 4621),
]


def extract_css() -> str:
    lines = STUDIO_CSS.read_text(encoding="utf-8").splitlines()
    chunks: list[str] = []
    header = """/* Seham Latino — curated section (Kajabi pack)
   Upload this file in Kajabi: Page settings → Custom CSS, or Theme custom CSS. */\n"""
    chunks.append(header)
    for start, end in CSS_LINE_RANGES:
        chunk = "\n".join(lines[start - 1 : end])
        chunks.append(chunk)
    chunks.append(
        """
/* Kajabi: ensure links inherit */
a.xp { color: inherit; text-decoration: none; }
"""
    )
    return "\n\n".join(chunks) + "\n"


def read_curated_blocks() -> tuple[str, str]:
    ar = ROOT / "index.html"
    en = ROOT / "en" / "index.html"
    text_ar = ar.read_text(encoding="utf-8")
    text_en = en.read_text(encoding="utf-8")
    import re

    pat = re.compile(
        r'<div class="closing-canvas">.*?'
        r'(<section class="wrap section curated".*?</section>)'
        r'\s*</div>',
        re.DOTALL,
    )
    m_ar = pat.search(text_ar)
    m_en = pat.search(text_en)
    if not m_ar or not m_en:
        raise SystemExit("Could not extract curated section from index HTML")

    def silk_block() -> str:
        return """  <div class="closing-silk" aria-hidden="true">
    <img class="closing-silk-upper" alt="" loading="lazy" decoding="async" width="300" height="130" src="assets/decorative/seham-silk-wave-upper.svg"/>
    <img class="closing-silk-lower" alt="" loading="lazy" decoding="async" width="300" height="120" src="assets/decorative/seham-silk-wave-lower.svg"/>
  </div>
"""

    block_ar = m_ar.group(1)
    block_en = m_en.group(1).replace('src="../', 'src="')

    full_ar = (
        '<div class="closing-canvas">\n'
        + silk_block()
        + "  "
        + block_ar.replace("\n", "\n  ")
        + "\n</div>\n"
    )
    full_en = (
        '<div class="closing-canvas">\n'
        + silk_block()
        + "  "
        + block_en.replace("\n", "\n  ")
        + "\n</div>\n"
    )
    return block_ar + "\n", full_ar, full_en


JS_MOTION = """/* Curated section scroll-in (optional). Add class js-motion on <html> via this script. */
(function () {
  "use strict";
  var root = document.documentElement;
  if (root.classList.contains("js-motion")) return;
  root.classList.add("js-motion");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    document.querySelectorAll(".curated, .closing-canvas").forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  function sectionalIn(sel) {
    var nodes = document.querySelectorAll(sel);
    if (!nodes.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: "16% 0px 10% 0px" }
    );
    nodes.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.96) {
        el.classList.add("is-in");
      } else {
        io.observe(el);
        window.setTimeout(function () {
          if (!el.classList.contains("is-in")) {
            el.classList.add("is-in");
            try { io.unobserve(el); } catch (_) {}
          }
        }, 2200);
      }
    });
  }

  sectionalIn(".curated");
  var canvas = document.querySelector(".closing-canvas");
  if (canvas) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -5% 0px" }
    );
    if (canvas.getBoundingClientRect().top < window.innerHeight) {
      canvas.classList.add("is-in");
    } else {
      cio.observe(canvas);
    }
  }
})();
"""

README = """SEHAM LATINO — حزمة تعديل قسم «طرق أخرى للتحرك معا» (Kajabi / السحابة)
================================================================================

المحتويات:
- snippets/curated-section-only-ar.html   — القسم فقط (عربي) للصق في كتلة HTML
- snippets/curated-section-only-en.html — القسم فقط (إنجليزي)
- snippets/curated-with-silk-ar.html    — القسم + خلفية الحرير (عربي)
- snippets/curated-with-silk-en.html    — القسم + خلفية الحرير (إنجليزي)
- css/curated-kajabi.css                — كل التنسيقات اللازمة
- js/curated-kajabi.js                  — حركة الظهور (اختياري)
- img/                                  — صور البطاقات الثلاث
- assets/decorative/                    — موجات الحرير SVG
- preview-ar.html / preview-en.html     — معاينة محلية قبل الرفع

خطوات Kajabi (مختصرة):
1. ارفعي مجلد img و assets إلى مكتبة الملفات (أو استضيفيها بنفس الروابط).
2. في صفحة الهبوط: أضيفي كتلة «Custom Code» أو «Code» والصقي محتوى
   curated-with-silk-ar.html (أو القسم فقط إن كان القماش موجوداً مسبقاً).
3. عدّلي روابط href للبطاقات (classes.html, coaching.html, gift.html)
   إلى روابط Kajabi الفعلية (دورات / صفحات / checkout).
4. عدّلي src للصور إذا استخدمتِ روابط CDN من Kajabi بدل المسارات النسبية.
5. الصقي css/curated-kajabi.css في: إعدادات الصفحة → Custom CSS
   (أو Theme → Custom CSS إن أردتِ تطبيقاً أوسع).
6. أضيفي js/curated-kajabi.js في Footer tracking / Custom script (اختياري).

الخطوط (Google Fonts — نفس الموقع):
  Tajawal + Aref Ruqaa (عربي)
  Jost + Cormorant Garamond (إنجليزي)

معاينة محلية:
  افتحي preview-ar.html أو preview-en.html من هذا المجلد عبر Live Server.

ملاحظة: هذا القسم كان داخل .closing-canvas على الموقع الأصلي؛
استخدمي نسخة with-silk إن أردتِ نفس المظهر العاجي مع موجات الحرير.
"""


def preview_html(lang: str, dir_attr: str, title: str, body_snippet: str) -> str:
    fonts = (
        "https://fonts.googleapis.com/css2?"
        "family=Aref+Ruqaa:wght@400;700"
        "&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600"
        "&family=Jost:wght@300;400"
        "&family=Tajawal:wght@400;500;700"
        "&display=swap"
    )
    return f"""<!DOCTYPE html>
<html lang="{lang}" dir="{dir_attr}" class="js-motion">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="{fonts}" rel="stylesheet"/>
<link href="css/curated-kajabi.css" rel="stylesheet"/>
</head>
<body style="margin:0;background:#f6eee6;">
<main>
{body_snippet}
</main>
<script src="js/curated-kajabi.js"></script>
</body>
</html>
"""


def main() -> None:
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)

    only_ar, full_ar, full_en = read_curated_blocks()
    only_en = (
        (ROOT / "en" / "index.html")
        .read_text(encoding="utf-8")
    )
    import re

    m = re.search(
        r'<section class="wrap section curated".*?</section>',
        only_en,
        re.DOTALL,
    )
    if not m:
        raise SystemExit("EN curated section not found")
    block_en = m.group(0).replace('src="../', 'src="')

    (OUT_DIR / "css").mkdir()
    (OUT_DIR / "js").mkdir()
    (OUT_DIR / "snippets").mkdir()
    (OUT_DIR / "img").mkdir(parents=True)
    (OUT_DIR / "assets" / "decorative").mkdir(parents=True)

    (OUT_DIR / "css" / "curated-kajabi.css").write_text(extract_css(), encoding="utf-8")
    (OUT_DIR / "js" / "curated-kajabi.js").write_text(JS_MOTION, encoding="utf-8")
    (OUT_DIR / "README-KAJABI.txt").write_text(README, encoding="utf-8")

    (OUT_DIR / "snippets" / "curated-section-only-ar.html").write_text(only_ar, encoding="utf-8")
    (OUT_DIR / "snippets" / "curated-section-only-en.html").write_text(block_en + "\n", encoding="utf-8")
    (OUT_DIR / "snippets" / "curated-with-silk-ar.html").write_text(full_ar, encoding="utf-8")
    (OUT_DIR / "snippets" / "curated-with-silk-en.html").write_text(full_en, encoding="utf-8")

    (OUT_DIR / "preview-ar.html").write_text(
        preview_html("ar", "rtl", "معاينة — طرق أخرى للتحرك معا", full_ar),
        encoding="utf-8",
    )
    (OUT_DIR / "preview-en.html").write_text(
        preview_html("en", "ltr", "Preview — Other ways to move", full_en),
        encoding="utf-8",
    )

    for name in (
        "sehamlatin-1.jpg",
        "life-coaching-cover.jpg",
        "seham-beach.jpg",
    ):
        shutil.copy2(ROOT / "img" / name, OUT_DIR / "img" / name)

    for name in ("seham-silk-wave-upper.svg", "seham-silk-wave-lower.svg"):
        shutil.copy2(ROOT / "assets" / "decorative" / name, OUT_DIR / "assets" / "decorative" / name)

    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in OUT_DIR.rglob("*"):
            if path.is_file():
                arc = path.relative_to(OUT_DIR.parent)
                zf.write(path, arc.as_posix())

    print("Created:", OUT_DIR)
    print("Zip:", ZIP_PATH, f"({ZIP_PATH.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()