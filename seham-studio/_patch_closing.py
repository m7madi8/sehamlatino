# -*- coding: utf-8 -*-
"""Patch homepage CTA + all footers into Signature Closing Experience."""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

ICO_IG = (
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" '
    'stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">'
    '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5"/>'
    '<circle cx="12" cy="12" r="3.8"/>'
    '<circle cx="17.2" cy="6.8" r="0.85" fill="currentColor" stroke="none"/>'
    "</svg>"
)
ICO_WA = (
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" '
    'stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M20 11.5A8.5 8.5 0 0 1 7.6 18.7L4 20l1.4-3.4A8.5 8.5 0 1 1 20 11.5Z"/>'
    '<path d="M8.8 9.2c.25-.55.4-.5.58-.5h.45c.18 0 .35.02.5.4.16.5.55 1.7.6 1.82.05.14.08.3 0 .45-.08.16-.12.26-.25.4-.12.12-.26.28-.37.38-.1.1-.22.22-.08.42.14.2.64 1.05 1.38 1.7.96.84 1.72 1.1 1.96 1.22.24.12.38.1.52-.06.14-.16.62-.72.78-.96.16-.24.32-.2.54-.12.22.08 1.42.67 1.66.8.24.12.4.18.46.28.06.1.06.6-.14 1.16-.2.56-1.18 1.08-1.64 1.15-.42.06-.98.1-1.58-.1-.36-.12-.8-.28-1.36-.55-2.4-1.14-3.96-3.78-4.08-3.96-.12-.18-.98-1.3-.98-2.48 0-1.18.62-1.76.84-2Z"/>'
    "</svg>"
)
ICO_MAIL = (
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" '
    'stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">'
    '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/>'
    '<path d="m5.2 7.8 6.1 4.4c.4.3.9.3 1.3 0l6.2-4.4"/>'
    "</svg>"
)
ARROW_AR = (
    '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" '
    'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M11.5 4.5H4.5v7"/><path d="m11.2 11.2-6.7-6.7"/>'
    "</svg>"
)
ARROW_EN = (
    '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" '
    'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M4.5 11.5h7v-7"/><path d="m4.8 4.8 6.7 6.7"/>'
    "</svg>"
)


def footer_ar(prefix: str) -> str:
    deco = f"{prefix}assets/decorative/seham-footer-divider.svg"
    logo = f"{prefix}img/seham-logo-white.png"
    return f"""<footer class="footer">
  <div class="footer-edge" aria-hidden="true">
    <img alt="" src="{deco}"/>
  </div>
  <div class="footer-inner">
    <div class="footer-main">
      <div class="footer-brand">
        <img alt="Seham Latino" class="footer-logo" src="{logo}"/>
        <h2>خذي مساحتك.<br/>وارقصي بطريقتك.</h2>
        <a class="footer-mail" dir="ltr" href="mailto:info.sehamlatino@gmail.com">info.sehamlatino@gmail.com</a>
        <div class="footer-social">
          <a href="https://www.instagram.com/sehamlatin/" aria-label="إنستغرام" rel="noopener noreferrer" target="_blank">{ICO_IG}</a>
          <a href="mailto:info.sehamlatino@gmail.com" aria-label="واتساب">{ICO_WA}</a>
          <a href="mailto:info.sehamlatino@gmail.com" aria-label="البريد الإلكتروني">{ICO_MAIL}</a>
        </div>
      </div>
      <div class="footer-links">
        <div>
          <h3>تعلّمي</h3>
          <a href="{prefix}online-course.html">باتشاتا ليدي ستايل</a>
          <a href="{prefix}courses.html">الأكاديمية</a>
          <a href="{prefix}classes.html">الحصص</a>
          <a href="{prefix}coaching.html">تدريب الحياة</a>
        </div>
        <div>
          <h3>الأكاديمية</h3>
          <a href="{prefix}about.html">قصتي</a>
          <a href="{prefix}gift.html">إهداء دورة</a>
          <a href="{prefix}library.html">مكتبتي</a>
          <a href="{prefix}membership.html">العضوية</a>
        </div>
        <div>
          <h3>نحن هنا</h3>
          <a href="{prefix}contact.html">تواصلي</a>
          <a href="{prefix}faq.html">الأسئلة الشائعة</a>
          <a href="{prefix}videos.html">فيديوهات</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Seham Latino</span>
      <div class="footer-legal">
        <a href="{prefix}privacy.html">الخصوصية</a>
        <span class="sep" aria-hidden="true">·</span>
        <a href="{prefix}accessibility.html">إمكانية الوصول</a>
      </div>
      <span class="footer-motto" dir="ltr">DANCE · LOVE · GROW</span>
    </div>
  </div>
</footer>"""


def footer_en(prefix: str) -> str:
    deco = f"{prefix}assets/decorative/seham-footer-divider.svg"
    logo = f"{prefix}img/seham-logo-white.png"
    return f"""<footer class="footer">
  <div class="footer-edge" aria-hidden="true">
    <img alt="" src="{deco}"/>
  </div>
  <div class="footer-inner">
    <div class="footer-main">
      <div class="footer-brand">
        <img alt="Seham Latino" class="footer-logo" src="{logo}"/>
        <h2>Take up space.<br/>Dance your way.</h2>
        <a class="footer-mail" href="mailto:info.sehamlatino@gmail.com">info.sehamlatino@gmail.com</a>
        <div class="footer-social">
          <a href="https://www.instagram.com/sehamlatin/" aria-label="Instagram" rel="noopener noreferrer" target="_blank">{ICO_IG}</a>
          <a href="mailto:info.sehamlatino@gmail.com" aria-label="WhatsApp">{ICO_WA}</a>
          <a href="mailto:info.sehamlatino@gmail.com" aria-label="Email">{ICO_MAIL}</a>
        </div>
      </div>
      <div class="footer-links">
        <div>
          <h3>Learn</h3>
          <a href="online-course.html">Bachata Lady Style</a>
          <a href="courses.html">Academy</a>
          <a href="classes.html">Studio classes</a>
          <a href="coaching.html">Coaching</a>
        </div>
        <div>
          <h3>Academy</h3>
          <a href="about.html">My story</a>
          <a href="gift.html">Gift a course</a>
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
    <div class="footer-bottom">
      <span>© 2026 Seham Latino</span>
      <div class="footer-legal">
        <a href="privacy.html">Privacy</a>
        <span class="sep" aria-hidden="true">·</span>
        <a href="accessibility.html">Accessibility</a>
      </div>
      <span class="footer-motto">DANCE · LOVE · GROW</span>
    </div>
  </div>
</footer>"""


CTA_AR = f"""  <section class="final-cta reveal-line" aria-label="الخطوة التالية">
    <div class="cta-silk" aria-hidden="true">
      <img class="cta-silk-a" alt="" src="assets/decorative/seham-silk-wave.svg"/>
      <img class="cta-silk-b" alt="" src="assets/decorative/seham-silk-wave.svg"/>
    </div>
    <div class="cta-stage">
      <h2>جسمك يعرف الطريق أصلاً.</h2>
      <div class="cta-actions">
        <a class="cta-buy" href="checkout.html">مراجعة الشراء {ARROW_AR}</a>
        <a class="cta-explore" href="online-course.html">أو اكتشفي المنهج كاملاً</a>
      </div>
    </div>
  </section>"""

CTA_EN = f"""  <section class="final-cta reveal-line" aria-label="Next step">
    <div class="cta-silk" aria-hidden="true">
      <img class="cta-silk-a" alt="" src="../assets/decorative/seham-silk-wave.svg"/>
      <img class="cta-silk-b" alt="" src="../assets/decorative/seham-silk-wave.svg"/>
    </div>
    <div class="cta-stage">
      <h2>Your body already knows the way.</h2>
      <div class="cta-actions">
        <a class="cta-buy" href="checkout.html">Review purchase {ARROW_EN}</a>
        <a class="cta-explore" href="online-course.html">Or discover the full curriculum</a>
      </div>
    </div>
  </section>"""

FOOTER_RE = re.compile(r"<footer class=\"footer\">.*?</footer>", re.S)
CTA_RE = re.compile(r"[ \t]*<section class=\"final-cta[^>]*>.*?</section>", re.S)


def patch_file(path: Path, *, lang: str, is_en_dir: bool) -> None:
    text = path.read_text(encoding="utf-8")
    prefix = "../" if is_en_dir else ""
    # For AR root pages, links inside footer should be relative without prefix.
    # For EN pages, same-dir links (no prefix) — assets need ../
    if lang == "ar":
        new_footer = footer_ar("")
    else:
        new_footer = footer_en("../" if False else "")  # EN pages stay in /en/
        # Fix asset paths for EN
        new_footer = footer_en("")
        new_footer = new_footer.replace('src="assets/', 'src="../assets/')
        new_footer = new_footer.replace('src="img/', 'src="../img/')

    if not FOOTER_RE.search(text):
        print("NO FOOTER", path)
        return
    text = FOOTER_RE.sub(new_footer, text, count=1)

    if path.name == "index.html":
        cta = CTA_EN if lang == "en" else CTA_AR
        if not CTA_RE.search(text):
            print("NO CTA", path)
        else:
            text = CTA_RE.sub(cta, text, count=1)

    path.write_text(text, encoding="utf-8", newline="\n")
    print("OK", path.relative_to(ROOT))


def main() -> None:
    for p in sorted(ROOT.glob("*.html")):
        patch_file(p, lang="ar", is_en_dir=False)
    for p in sorted((ROOT / "en").glob("*.html")):
        patch_file(p, lang="en", is_en_dir=True)


if __name__ == "__main__":
    main()
