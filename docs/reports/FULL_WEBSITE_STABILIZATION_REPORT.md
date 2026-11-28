# FULL WEBSITE STABILIZATION REPORT

**Project:** Seham Latino Dance Academy  
**Stabilization build:** `stabilize-1` / motion `rhythm-3.1`  
**Date:** 2026-11-27  

---

## Confirmed problems (root causes)

| Issue | Root cause | Fix |
|--------|------------|-----|
| **Delayed academy video** | No visible poster; video `opacity: 0` until `.is-in` **and** play; source armed only at high intersection ratio; **`requestIdleCallback` deferred play** | Poster image + dual IO (prep/play); immediate `tryPlay()`; CSS `is-live` crossfade |
| **Blank media frame** | `.academy-flagship-poster { display: none }` | Restored poster layer with seamless fade |
| **Late section entrances** | Conservative IO margins; slow GSAP token durations | Eager `rootMargin`; shorter rhythm-3.1 timings |
| **Skipped animations / late content** | Aggressive `scrollIsFast` (2.6) | Raised to **4.2** — only true flings skip tween |
| **Scroll jank at boundaries** | Duplicate RAF, header layout reads, duplicate observers (prior pass) | Retained `scroll-perf-1` bus + chapter ratio pick + GSAP/legacy dedupe |
| **Diagnostics in production** | Unconditional `seham-perf-diag.js` | Loads **only** when `?perf=` present |
| **Animation/CSS ownership** | `.js-motion` forced video opacity with section `.is-in` | Video visibility owned by **`is-live`** only |

---

## Production pages (canonical)

| Locale | Homepage | Notes |
|--------|----------|-------|
| AR | `index.html` | Primary |
| EN | `en/index.html` | Primary |
| AR mirror | `ar/*` | Legacy/duplicate paths — same stack pattern |
| Inner | `online-course.html`, `checkout.html`, `courses.html`, etc. | Share `studio.js` |

**Non-production:** `preview-ar.html`, `preview-en.html`, loader previews, fragments.

---

## Modified files

| File | Change |
|------|--------|
| `index.html`, `en/index.html` | Academy **poster** + `poster=` on video; conditional perf diag; cache `stabilize-1` / `rhythm-3.1` |
| `studio.js` | Premium video prep/play observers; removed idle defer; `stabilize-1` |
| `studio.css` | Poster visible; video fade via `.is-live`; decouple video from `.is-in` opacity |
| `seham-motion.js` | rhythm-3.1 timings, eager IO, fast-scroll threshold |
| `seham-perf-diag.js` | Unchanged; **not** loaded in production |

---

## Video architecture (academy flagship)

1. **Poster** — `img.course-hero-burgundy.png` visible immediately (same approved asset as courses/checkout).
2. **Prep observer** — `rootMargin: 280px / 360px` (desktop), arms `data-src` + `metadata` preload once.
3. **Play observer** — lower ratio (**0.12** desktop), immediate play attempt.
4. **Transition** — poster fades on `loadeddata` / `playing` → `.is-live` (no black frame).
5. **Mobile** — tap-to-play unchanged; frame `pointer-events` enabled for gesture.
6. **Asset** — `bachata-lady-style.mp4` ~2.8 MB; **moov at byte 40** (web-fast-start OK).

---

## Animation repairs

- **rhythm-3.1:** text 0.58–0.72s, media 0.82s, stagger 0.05–0.06.
- Fail-open legacy unlocks (rhythm-2) retained.
- Desktop: GSAP owns section entrances; legacy IO deduped.

---

## Scroll performance (carried forward)

- Single Lenis/chrome RAF while gliding.
- Chapter header without `getBoundingClientRect` on scroll.
- See `SCROLL_PERFORMANCE_ENGINEERING_REPORT.md` for isolation tests (`?perf=A`…`H`).

---

## Browser verification (lab)

**URL:** `http://localhost:8773/index.html?v=stabilize-1` (hard refresh)

| Check | Result |
|-------|--------|
| Academy poster visible | **PASS** — `course-hero-burgundy.png`, opacity 1 |
| Video prep class | **PASS** — `is-prep` after scroll to academy |
| Hidden cards/photos after scroll | **PASS** — `bad: []` |
| GSAP pilot | **NOT VERIFIED** — lab lacks `pointer: fine` |
| Full site 14 breakpoints | **NOT VERIFIED** |
| Wheel scroll frame times | **NOT VERIFIED** on user hardware |
| LCP / CLS formal | **NOT MEASURED** |

---

## Remaining blockers

1. **Fine-pointer desktop** — confirm GSAP + Lenis + video handoff with real wheel input (Chrome Performance).
2. **`ar/` tree** — home may lag `index.html`; audit if still linked in production DNS.
3. **Autoplay policy** — embedded preview may show poster + `is-live` with paused video; expected on some environments until user gesture.

---

## Acceptance status

| Criterion | Status |
|-----------|--------|
| Content visible | **PASS** (lab homepage) |
| Video poster immediate | **PASS** |
| Video prep before viewport | **PASS** (prep IO) |
| Design preserved | **PASS** (approved poster asset only) |
| Scroll / motion on real desktop | **VERIFY LOCALLY** |
| All inner pages | **SPOT NOT RUN** |

**Verdict:** **Stabilization implemented** — production sign-off requires **your** desktop wheel test on AR + EN homepages after hard refresh.

---

**SEHAM LATINO — THE RHYTHM OF MOTION**