# SEHAM LATINO — Cadencia Íntima

Static bilingual front-end. Tagline: **BE YOURSELF. IN EVERY MOVE.**

Creative direction: **Cadencia Íntima** — Bachata’s measure (anticipation, step, pause, release) translated into editorial composition, typography, and motion.

## Run
1. Open `index.html` (Arabic) or `en/index.html` (English).
2. Optional local server: `python -m http.server 8000` from this folder, then visit `http://localhost:8000`.
3. Copy `fonts/` from the original archive (`meral-*.woff2`, `najwa-regular.woff2`, `lifta-regular.woff2`) into this folder if available. Without fonts, system fallbacks are used (Arabic → Meral/Tahoma; English display → Iowan Old Style / Palatino / Georgia).

## Structure
- Root HTML: Arabic default (`dir="rtl"`).
- `en/`: full English mirror.
- `ar/`: legacy redirects to root Arabic pages.
- `studio.css`: Cadencia Íntima design system (tokens, chrome, components, RTL/LTR, responsive, motion).
- `studio.js`: sticky/scrolled header, read progress, atelier drawer (a11y), reveal choreography, checkout currency display, lesson preview selector.
- `img/`: authentic photography and logos only.

## Pages (18 × 2 languages)
Home, Academy, Course detail, Studio classes, Coaching, About, Videos, Membership, Gift, Contact, FAQ, Register, Privacy, Accessibility, Library, Account, Checkout, Lesson preview.

## Scope
Standalone static front-end for the new Seham Latino project. Checkout currency toggle is display-only. Lesson room is a curriculum preview, not a full video player.

## Design notes
- Palette: garnet `#5C1A32`, paper `#F6EEE6`, blush `#E8D5CF`, ink `#2C1A1C`, night `#241018`.
- Hero: full-bleed presence photography; independently art-directed mobile.
- Commercial heart: Bachata Lady Style editorial spread (₪335 / $110 · 10 lessons · 3.5h · 12 months).
- Mobile menu: full-viewport atelier with editorial type.
- Motion respects `prefers-reduced-motion`.

## QA performed
- Local HTTP server render of EN/AR homepage, course detail, atelier menu.
- Viewports exercised: 1440, 390 (plus CSS breakpoints at 1100 / 900 / 760 / 460).
- Drawer open/close, focus return, scroll header, and lesson/currency hooks preserved.
- Fonts not bundled — 404 expected until `fonts/` is copied.

Sources: project photography, logos, and studio assets bundled in this repository.
