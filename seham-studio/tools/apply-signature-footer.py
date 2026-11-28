# -*- coding: utf-8 -*-
"""Apply sl-footer markup from seham-footer-preview-*.html across seham-studio pages."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ICO_IG = (
    '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" '
    'stroke-linejoin="round" stroke-width="1.35" viewBox="0 0 24 24">'
    '<rect height="16.8" rx="5" width="16.8" x="3.6" y="3.6"/>'
    '<circle cx="12" cy="12" r="3.8"/>'
    '<circle cx="17.2" cy="6.8" fill="currentColor" r="0.85" stroke="none"/>'
    "</svg>"
)
ICO_MAIL = (
    '<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" '
    'stroke-linejoin="round" stroke-width="1.35" viewBox="0 0 24 24">'
    '<rect height="13" rx="3" width="17" x="3.5" y="5.5"/>'
    '<path d="m5.2 7.8 6.1 4.4c.4.3.9.3 1.3 0l6.2-4.4"/>'
    "</svg>"
)

FOOTER_RE = re.compile(
    r'<footer class="(?:footer|sl-footer)"[^>]*>.*?</footer>',
    re.S,
)


def footer_ar(link_prefix: str, asset_prefix: str) -> str:
    lp = link_prefix
    return f"""<footer class="sl-footer" lang="ar" dir="rtl">
  <div class="sl-footer__silk" aria-hidden="true"></div>
  <div class="sl-footer__inner">
    <div class="sl-footer__main">
      <div class="sl-footer__brand">
        <img alt="Seham Latino — Dance, Love, Grow" class="sl-footer__logo" height="150" src="{asset_prefix}img/brand/seham-footer-logo-gold.png" width="243"/>
        <h2 class="sl-footer__headline">خذي مساحتك.<br/>وارقصي بطريقتك.</h2>
        <a class="sl-footer__mail" dir="ltr" href="mailto:info.sehamlatino@gmail.com">info.sehamlatino@gmail.com</a>
        <div class="sl-footer__social">
          <a aria-label="إنستغرام" href="https://www.instagram.com/sehamlatin/" rel="noopener noreferrer" target="_blank">{ICO_IG}</a>
          <a aria-label="البريد الإلكتروني" href="mailto:info.sehamlatino@gmail.com">{ICO_MAIL}</a>
        </div>
      </div>
      <div class="sl-footer__links">
        <div>
          <h3>تعلّمي</h3>
          <a href="{lp}online-course.html">باتشاتا ليدي ستايل</a>
          <a href="{lp}courses.html">الأكاديمية</a>
        </div>
        <div>
          <h3>الأكاديمية</h3>
          <a href="{lp}library.html">مكتبتي</a>
          <a href="{lp}membership.html">العضوية</a>
        </div>
        <div>
          <h3>نحن هنا</h3>
          <a href="{lp}contact.html">تواصلي</a>
          <a href="{lp}faq.html">الأسئلة الشائعة</a>
          <a href="{lp}videos.html">فيديوهات</a>
        </div>
      </div>
    </div>
    <div class="sl-footer__bottom">
      <span>© 2026 Seham Latino</span>
      <div class="sl-footer__legal">
        <a href="{lp}privacy.html">الخصوصية</a>
        <a href="{lp}accessibility.html">إمكانية الوصول</a>
      </div>
      <span class="sl-footer__motto" dir="ltr">DANCE · LOVE · GROW</span>
    </div>
  </div>
</footer>"""


def footer_en(asset_prefix: str) -> str:
    return f"""<footer class="sl-footer" lang="en" dir="ltr">
  <div class="sl-footer__silk" aria-hidden="true"></div>
  <div class="sl-footer__inner">
    <div class="sl-footer__main">
      <div class="sl-footer__brand">
        <img alt="Seham Latino — Dance, Love, Grow" class="sl-footer__logo" height="150" src="{asset_prefix}img/brand/seham-footer-logo-gold.png" width="243"/>
        <h2 class="sl-footer__headline">Take up space.<br/>Dance your way.</h2>
        <a class="sl-footer__mail" href="mailto:info.sehamlatino@gmail.com">info.sehamlatino@gmail.com</a>
        <div class="sl-footer__social">
          <a aria-label="Instagram" href="https://www.instagram.com/sehamlatin/" rel="noopener noreferrer" target="_blank">{ICO_IG}</a>
          <a aria-label="Email" href="mailto:info.sehamlatino@gmail.com">{ICO_MAIL}</a>
        </div>
      </div>
      <div class="sl-footer__links">
        <div>
          <h3>Learn</h3>
          <a href="online-course.html">Bachata Lady Style</a>
          <a href="courses.html">Academy</a>
        </div>
        <div>
          <h3>Academy</h3>
          <a href="library.html">My library</a>
          <a href="membership.html">Membership</a>
        </div>
        <div>
          <h3>We are here</h3>
          <a href="contact.html">Contact</a>
          <a href="faq.html">FAQs</a>
          <a href="videos.html">Short films</a>
        </div>
      </div>
    </div>
    <div class="sl-footer__bottom">
      <span>© 2026 Seham Latino</span>
      <div class="sl-footer__legal">
        <a href="privacy.html">Privacy</a>
        <a href="accessibility.html">Accessibility</a>
      </div>
      <span class="sl-footer__motto">DANCE · LOVE · GROW</span>
    </div>
  </div>
</footer>"""


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    is_en = "en" in path.parts and path.parent.name == "en"
    if is_en:
        new_footer = footer_en("../")
    else:
        new_footer = footer_ar("", "")
    if not FOOTER_RE.search(text):
        return False
    text = FOOTER_RE.sub(new_footer, text, count=1)
    path.write_text(text, encoding="utf-8", newline="\n")
    return True


def apply_root(root: Path) -> int:
    skip = {
        "preview-ar.html",
        "preview-en.html",
        "preloader-fragment.html",
        "seham-loader-handwritten.html",
        "Seham Latino — Loader Preview.html",
        "bachataladystyle.html",
    }
    count = 0
    for pattern in ("*.html", "en/*.html"):
        for p in sorted(root.glob(pattern)):
            if p.name in skip or "partials" in p.parts or (p.parent.name == "ar" and "ar" in p.parts):
                continue
            if patch_file(p):
                print("OK", p.relative_to(root))
                count += 1
    return count


def main() -> None:
    import sys

    roots = [ROOT]
    if len(sys.argv) > 1:
        roots = [Path(a).resolve() for a in sys.argv[1:]]
    total = 0
    for root in roots:
        total += apply_root(root)
    print(f"Patched {total} files.")


if __name__ == "__main__":
    main()