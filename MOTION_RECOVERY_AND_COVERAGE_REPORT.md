# MOTION RECOVERY AND COVERAGE REPORT — Phase 06

**Project:** Seham Latino Dance Academy  
**Motion version:** `rhythm-2`  
**Date:** 2026-11-27  
**Author:** Phase 06 recovery pass (code + targeted browser verification)

---

## Executive summary

Production-blocking regressions were caused by **dual visibility systems** (legacy `.js-motion` CSS gates + GSAP `from()` opacity) without synchronized **legacy unlock classes** (`is-in`, `is-visible`, `is-portrait-in`, `ap-in`). Parents or nested images could remain at **computed opacity 0** even when a GSAP parent timeline appeared to run.

**rhythm-2** restores visibility first via **fail-open legacy unlocks**, section IO failsafes, and safer ownership CSS, then runs desktop GSAP choreography only when `(min-width: 761px) + fine pointer + hover + no reduced motion`.

**Production readiness:** **Conditional** — legacy/coarse-pointer path **verified in browser**; fine-pointer GSAP path **code-complete, lab NOT VERIFIED** (embedded browser reports `pointer: fine` = false).

---

## 1. Root causes of disappeared content

| Root cause | Symptom | Mechanism |
|------------|---------|-----------|
| Legacy sectional gates | Academy flagship / soon cards invisible | `.js-motion .academy-*` and `.academy-soon` at `opacity: 0` until `.academy.is-in` (`studio.css` ~4213+) |
| Nested curated media | Service card photos “missing” | `.xp--studio .xp-media img` at `opacity: 0` until `.curated.is-in` (`studio.css` ~4230–4260) |
| Reveal-line parent | Testimonials / final CTA block invisible | `.reveal-line` / `.motion-ready` at `opacity: 0` until `.is-visible` (`studio.css` ~7714–7734) |
| Freedom portrait | Portrait hidden | `.freedom-portrait-img` at `opacity: 0` until `.freedom.is-portrait-in` (`studio.css` ~3462–3477) |
| GSAP `from({ opacity: 0 })` | Stuck hidden if IO/timeline skipped | Inline start state before legacy unlock |
| Harmful `opacity: unset` (rhythm-1) | Unpredictable cascade after choreo | Removed in rhythm-2 `seham-motion.css` |
| `claimRevealLines()` outside matchMedia (rhythm-1) | Mobile/desktop mismatch | Moved inside desktop `matchMedia` callback in rhythm-2 |
| `failSafeVisible()` incomplete | GSAP failure left legacy gates closed | Now calls `unlockAllLegacy()` |
| Reveal IO without failsafe | `freedom-inner` / `final-cta` could stick at 0 | **2.6s failsafe** added in `studio.js` |
| `about-portrait.js` early exit | Coarse pointer at ≥761px lost mobile about JS | Gated on same `DESKTOP_CHOREO` query as GSAP |

---

## 2. Affected sections and elements (user-reported)

| Section | Elements recovered | Primary fix |
|---------|-------------------|-------------|
| Hero | `hero-enter--2/3/4` | Loader handoff + GSAP; cinema class failsafe |
| Academy | display, lead, flagship, copy, **upcoming**, **soon cards** | `is-in` before timeline; animate flagship + soon |
| Testimonials | portrait, inner wrap, manifesto, voices, quote | `is-visible` + `is-portrait-in` before timeline |
| About | photo, `.ap-title`, `.ap-bio` | GSAP + `ap-in`/`ap-done` on complete; portrait JS guard fixed |
| Services | `.curated-head`, `.xp`, card images | `is-in` before card stagger |
| Gift | `.sg-photo`, copy stack | Observer + copy stagger (no silk transform) |
| Final CTA | `h2`, `.cta-actions` | `is-visible` before timeline |

---

## 3. File changes (line-level)

| File | Change |
|------|--------|
| `seham-studio/seham-motion.js` | **rhythm-2**: `unlockAllLegacy`, `unlockSectionLegacy`, IO 2.6s failsafe, legacy unlock at choreo start, academy soon/flagship, hero/loader races, `claimRevealLines` inside matchMedia, matchMedia cleanup |
| `seham-studio/seham-motion.css` | Removed `opacity: unset`; transition suppression only; reduced-motion hard visible |
| `seham-studio/studio.js` | Reveal-line **2600ms failsafe** (mirrors academy/curated) |
| `seham-studio/about-portrait.js` | Skip only when `DESKTOP_CHOREO` matches (not bare `min-width: 761px`) |
| `seham-studio/index.html`, `en/index.html` | Cache bust `?v=rhythm-2` on motion assets |

---

## 4. Selector validation (AR + EN)

Required choreo selectors — both homepages contain targets (spot-check + class token counts):

| Selector | AR | EN | Notes |
|----------|----|----|-------|
| `.ap-title` | ✓ | ✓ | No `.ap-name` in markup |
| `.academy-upcoming-heading` | ✓ | ✓ | |
| `.academy-soon` | 2 | 2 | |
| `.xp` | 3 cards | 3 cards | Includes `.xp--studio` |
| `.sg-kicker`, `.sg-desc` | ✓ | ✓ | Optional in timeline |
| `.freedom-quote.is-active` | ✓ | ✓ | Inactive slides excluded by design |

Zero-match **required** selectors: **none found**.

---

## 5. CSS / GSAP ownership (reconciled)

| Property | Owner (desktop GSAP pilot) | Owner (mobile / coarse) |
|----------|---------------------------|-------------------------|
| Section blocks academy/curated | GSAP timeline + `.is-in` unlock | `studio.js` sectional IO + failsafe |
| `.reveal-line` parents | GSAP claims + `.is-visible` at choreo | `studio.js` reveal IO + failsafe |
| About sculptural | GSAP `choreoAbout` | `about-portrait.js` below 761px or coarse desktop |
| Footer | **Static** | Static |
| Lenis | `studio.js` single instance | Unchanged |

---

## 6. Visibility lifecycle (fail-open)

1. `js-motion` adds hidden **preparation** states only when motion is allowed and IO/GSAP will unlock.
2. **`unlockSectionLegacy()`** runs at each section choreo start and on IO failsafe timeout.
3. **`failSafeVisible()`** on GSAP timeout/error: clears inline props, `unlockAllLegacy()`, adds `sm-gsap-fallback`.
4. **`clearGsapInline()`** on timeline complete to restore CSS cascade.
5. matchMedia **revert** callback unlocks legacy when leaving desktop choreo breakpoint.

No global `opacity: 1 !important` on essential content (except reduced-motion safety block).

---

## 7. Motion coverage matrix (homepage)

| Section | Element | Selector | Match | Animation owner | Trigger | Desktop | Mobile | Resting | Status |
|---------|---------|----------|-------|-----------------|---------|---------|--------|---------|--------|
| Hero | Headline | `.hero-enter--2` | 1 | GSAP | post preload / cinema | Fade up | CSS hero | visible | Lab: coarse only |
| Hero | Lede | `.hero-enter--3` | 1 | GSAP | chained | Fade up | CSS | visible | Same |
| Hero | CTAs | `.hero-enter--4` | 1 | GSAP | chained | Fade up | CSS | visible | Same |
| Academy | Label block | `.academy-display` | 1 | GSAP | IO | Staggered | CSS `is-in` | visible | **Verified** coarse |
| Academy | Lead | `.academy-lead` | 1 | GSAP | IO | Fade up | CSS | visible | **Verified** |
| Academy | Flagship | `.academy-flagship` | 1 | GSAP | IO | Fade up | CSS | visible | **Verified** |
| Academy | Soon grid | `.academy-soon` | 2 | GSAP | IO | Stagger | CSS | visible | **Verified** |
| Testimonials | Inner | `.freedom-inner` | 1 | GSAP + reveal | IO | Parent visible | CSS reveal | visible | **Verified** |
| Testimonials | Portrait | `.freedom-portrait-img` | 1 | GSAP | IO | Soft entrance | CSS portrait | visible | **Verified** |
| About | Photo/title/bio | `.ap-photo`, `.ap-title`, `.ap-bio` | 1 each | GSAP | IO | Layered | `about-portrait.js` | visible | **Verified** coarse |
| Services | Head | `.curated-head` | 1 | GSAP | IO | Fade up | CSS `is-in` | visible | **Verified** |
| Services | Cards | `.xp` | 3 | GSAP | IO stagger | Card comp. | CSS cascade | visible | **Verified** |
| Gift | Photo + copy | `.sg-photo`, `.sg-copy > *` | 1+ | GSAP | IO | Editorial | CSS/static | visible | **Verified** |
| Final CTA | Heading/actions | `h2`, `.cta-actions` | 1 | GSAP | IO | Soft | reveal-line | visible | **Verified** |
| Footer | All | `footer` | 1 | **Static** | — | — | — | visible | By design |

---

## 8. Desktop animation verification

| Check | Result |
|-------|--------|
| 1440×900 Arabic scroll-through | **PARTIAL** — Lenis; programmatic scroll + computed opacity audit: **0 stuck elements** after full scroll |
| Fine-pointer GSAP pilot (`sm-gsap-pilot`) | **NOT VERIFIED** — lab `matchMedia('(pointer: fine)')` = false |
| GSAP disabled (timeout path) | **NOT VERIFIED** — `failSafeVisible` implemented, not fault-injected |
| 1024 / 1920 widths | **NOT VERIFIED** |
| Section screenshots | **NOT CAPTURED** in this pass |

---

## 9. Mobile animation verification

| Width | Result |
|-------|--------|
| 375 / 390 (coarse path) | **PARTIAL** — same codebase path as lab; legacy IO + failsafes; no GSAP pilot |
| Touch scroll / Lenis | **NOT VERIFIED** in automation |

---

## 10. Before / after

| Before (rhythm-1) | After (rhythm-2) |
|-------------------|------------------|
| Cards/photos at opacity 0 without `is-in` | `is-in` / `is-visible` applied at choreo + failsafe |
| `opacity: unset` ownership leaks | Transition-only ownership rules |
| Reveal sections could stick hidden | 2.6s reveal failsafe in `studio.js` |
| `state.sections` true but content hidden | Resting opacity audit empty after scroll |

Screenshots: **not attached** (tooling); recommend capture on real desktop fine-pointer device.

---

## 11. Performance

| Metric | Phase 05 lab | This pass |
|--------|--------------|-----------|
| Avg frame time | ~33ms (non-comparable) | **NOT MEASURED** |
| Concurrent timelines | — | Capped per-section on IO |

No new scroll libraries. Lenis unchanged. Removed harmful repaints from stuck invisible layers (user-visible jank reduction expected).

---

## 12. Loader handoff (hero)

- Listens `seham:preload-done` **or** immediate path when not `is-preloading`
- MutationObserver on `is-cinema-entered`
- **1400ms** hero safety timer
- `heroRan` guard against duplicate timelines (retained)

Stress cases (GSAP late, failed CDN): **NOT fault-injected**.

---

## 13. Remaining issues

1. **Fine-pointer GSAP choreography** — needs verification on physical desktop/laptop (mouse/trackpad).
2. **Screenshot / perf baselines** — not collected this pass.
3. **`instantRender` on GSAP `from()`** — default; mitigated by legacy unlock **before** timeline build; monitor for first-frame flash.
4. **Studio card inner copy** — inherits visibility via `.curated.is-in` CSS cascade (not individually GSAP’d); intentional to avoid over-motion.

---

## 14. Acceptance checklist

| Criterion | Status |
|-----------|--------|
| Missing photographs restored | **PASS** (coarse-path lab) |
| Missing cards restored | **PASS** |
| Missing sections / text restored | **PASS** |
| Selectors verified AR/EN | **PASS** |
| Motion coverage intentional | **PASS** (matrix) |
| Legacy/GSAP conflicts reduced | **PASS** |
| Desktop GSAP motion | **NOT VERIFIED** (pointer media) |
| Mobile motion | **PARTIAL** |
| Static / reduced fallback | **PASS** (code) |
| No design/layout changes | **PASS** |

---

## 15. Production-readiness verdict

**CONDITIONAL GO**

Ship **rhythm-2** after **one fine-pointer desktop pass** (AR + EN, slow + fast scroll, refresh mid-page). Do not treat Phase 05 QA or `state.sections` alone as proof.

---

**SEHAM LATINO — THE RHYTHM OF MOTION**