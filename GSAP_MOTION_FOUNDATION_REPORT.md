# Seham Latino — GSAP Motion Foundation Report (Phase 03)

Date: 27 November 2026  
Scope: `seham-studio/` homepage pilots (AR + EN)  
Prior work: `MOTION_PERFORMANCE_AUDIT.md`, `PERFORMANCE_OPTIMIZATION_REPORT.md`

---

## 1. Executive summary

Phase 03 adds a **local GSAP 3.12.7** core (`vendor/gsap.min.js`) and a centralized module **`seham-motion.js`** with motion tokens, `gsap.context()` lifecycle, `gsap.matchMedia()` desktop gating, failure/reduced-motion fallbacks, and **three desktop-only entrance pilots** (hero copy, academy copy, about portrait). **ScrollTrigger, SplitText, and ScrollSmoother are not installed.** **Lenis 1.1.20** and `studio.js` observers are unchanged.

Mobile (≤760px) keeps the existing CSS / `about-portrait.js` motion stack.

---

## 2. Phase 02 baseline verification

| Check | Result |
|-------|--------|
| Course hero WebP in HTML | **Pass** — `dscf9871-hero-*.webp` `srcset` on both course pages |
| 51.9 MB JPEG in production HTML/CSS | **Pass** — only referenced in `tools/phase02-optimize-images.py` |
| Mobile hero WebP | **Pass** — `<picture>` WebP sources on AR/EN home |
| Footer external silk | **Pass** — `img/sl-footer-silk.webp` in `studio.css` (4 URL refs) |
| Academy video strategy | **Pass** — deferred `load()` / metadata / mobile tap (Phase 02 `studio.js`) |
| Lenis config | **Pass** — no edits in Phase 03 |
| Visual layout | **Pass** (spot-check); no layout/CSS redesign |

**2,400px scroll glide (baseline):** Historical audit: 103 frames, ~16.5 ms avg, 17 ms worst, 0 long tasks. **NOT RE-MEASURED** after GSAP in this pass (embedded lab; no paired cold/warm trace). See §14.

---

## 3. GSAP installation

| Item | Value |
|------|--------|
| Package | GSAP core only |
| Version | **3.12.7** |
| Source | [jsdelivr npm mirror](https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js) (one-time fetch into repo; **not** a runtime CDN dependency) |
| Path | `seham-studio/vendor/gsap.min.js` |
| Size | **72,304 bytes** |
| Plugins | None |

Loaded on homepage only (AR `index.html`, EN `en/index.html`), **after** `studio.js` / `about-portrait.js`, **before** `seham-motion.js`.

---

## 4. Motion architecture

```
index.html / en/index.html
  preloader.js          (unchanged loader)
  studio.js             Lenis, business logic, legacy reveal IOs
  gift-experience.js
  about-portrait.js     mobile + fallback; defers desktop to seham-motion
  vendor/gsap.min.js
  seham-motion.js       centralized pilots + ownership overrides
  seham-motion.css      pilot-specific CSS conflict guards
```

**`window.__sehamMotion`** exposes `{ version, tokens, gsapVersion, state, destroy() }` for debugging and future phases.

**Duplicate init guard:** prior instance `destroy()` on re-entry.

**No GSAP ticker integration with Lenis** — entrance timelines run on their own clock.

---

## 5. Animation ownership map (pilots)

| Element / region | Previous owner | Phase 03 owner | Notes |
|------------------|----------------|----------------|-------|
| Hero `.hero-enter--2/3/4` | CSS `heroCinemaCopy` (mobile ≤760) | **GSAP** (desktop ≥761) | Mobile CSS unchanged |
| Hero photograph / LCP still | `<picture>` + `studio.js` still path | **Unchanged** | No GSAP on media |
| Hero scroll parallax | `studio.js` `onScroll` | **Unchanged** | ≤16px translate |
| `.academy-display`, `.academy-lead` | CSS `.js-motion` + `.is-in` | **GSAP** (desktop pilot) | `is-in` still set by `studio.js` for failsafe / upcoming cards |
| `.academy-flagship-body` copy | CSS `.js-motion` + `.is-in` | **GSAP** (desktop pilot) | Video card / IO **unchanged** |
| `.academy-flagship-video` | `studio.js` IntersectionObserver | **Unchanged** | Not animated by GSAP |
| `.academy-upcoming` | CSS + sectional IO | **Unchanged** | |
| `.about-portrait` desktop | `about-portrait.js` + CSS `ap-in` | **GSAP** (desktop) | JS early-return when `data-seham-motion` present |
| `.about-portrait` mobile | `about-portrait.js` | **Unchanged** | |
| Global `.reveal-*` IO | `studio.js` | **Unchanged** | |
| Chapter / purchase bar IO | `studio.js` | **Unchanged** | |
| Loader | `preloader.js` | **Unchanged** | Not GSAP |

**Property rule:** GSAP pilots animate **opacity + translateY** only on semantic blocks (no character splitting; Arabic lines stay intact).

---

## 6. Motion design tokens (`seham-motion.js`)

| Token | Value | Use |
|-------|-------|-----|
| `easePrimary` | `power3.out` | Academy copy |
| `easeSoft` | `power2.out` | About portrait |
| `easeEditorial` | `power4.out` | Hero typography |
| `micro` | 0.3 s | Reserved |
| `text` | 0.75 s | Hero / academy text |
| `media` | 0.95 s | About portrait shell |
| `stagger` | 0.08 s | Sequences |
| `yDesktop` | 18 px | Entrance travel |

---

## 7. Lenis integration decision

**No change.** Conditional Lenis RAF (`autoRaf: false`, glide-only loop) remains the sole scroll smoothing clock. GSAP does not register a perpetual ticker. Rationale: Phase 03 is entrance-only; merging clocks had no measured benefit and risks idle CPU / lock regressions.

---

## 8. RAF and ticker architecture

| Clock | Owner | When active |
|-------|--------|-------------|
| Lenis RAF | `studio.js` | Desktop wheel glide only |
| Scroll coalescing RAF | `studio.js` | During native scroll events |
| GSAP internal | GSAP | During active entrance timelines only |

**Idle expectation:** No continuous GSAP animation loops.

---

## 9. Implemented pilot animations

**Gate:** `gsap.matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)")`

1. **Hero typography** — After `is-cinema-entered` (or 1.2 s failsafe), staggered `from()` on `.hero-enter--2/3/4`.
2. **Academy** — One-shot IO on `.academy`; staggered intro + flagship **body** copy (not video).
3. **About Seham** — One-shot IO on `.about-portrait`; portrait block + `.ap-name` / `.ap-bio`; adds `ap-in` for contour CSS completion (stroke); no SplitText, no img scale distortion.

**Active timelines (lab):** 3 when pilots run (`state.timelines`).

---

## 10. Arabic typography safeguards

- Animations target **whole** `h1`, `p`, and `.ap-name` / `.ap-bio` nodes.
- **No** SplitText or per-character spans.
- RTL/LTR inherited from document; GSAP does not alter `dir` or font stacks.
- Overflow: no extra clipping wrappers added in pilot.

---

## 11. Mobile motion strategy

- **≤760px:** Existing CSS hero cinema copy, CSS academy reveals, and `about-portrait.js` remain authoritative.
- **No** GSAP matchMedia context on narrow viewports.
- Native touch scroll; Lenis `syncTouch: false` preserved.

---

## 12. Accessibility implementation

| Case | Behavior |
|------|----------|
| `prefers-reduced-motion: reduce` | `seham-motion` exits; `failSafeVisible()`; no timelines |
| GSAP missing / load error | Fall back to CSS/JS entrances; content never forced hidden |
| `matchMedia` preference change | `destroy()` reverts contexts |
| Above-the-fold | Hero / in-view sections use immediate or short failsafe timers |

`seham-motion.css` forces full visibility under `prefers-reduced-motion`.

---

## 13. Modified files

| File | Change |
|------|--------|
| `vendor/gsap.min.js` | **Added** (3.12.7) |
| `seham-motion.js` | **Added** — motion foundation |
| `seham-motion.css` | **Added** — ownership / conflict guards |
| `index.html`, `en/index.html` | Link motion CSS; defer GSAP + motion scripts |
| `about-portrait.js` | Desktop deferral when motion module present |

**Not modified:** `studio.js` Lenis block, `preloader.*`, course pages, `MOTION_PERFORMANCE_AUDIT.md`, `PERFORMANCE_OPTIMIZATION_REPORT.md`.

---

## 14. Before-and-after measurements

| Metric | Phase 02 baseline | Phase 03 (this pass) |
|--------|-------------------|----------------------|
| GSAP bytes | 0 | **72,304** |
| Motion module | — | **7,297** (`seham-motion.js`) |
| Scroll glide 2400px | 103 fr / 16.5 ms avg (audit) | **NOT MEASURED** |
| FCP / LCP / CLS / INP | NOT MEASURED (Phase 02 report) | **NOT MEASURED** |
| Long tasks | 0 (audit glide) | **NOT MEASURED** |
| Lenis present (lab) | — | **Yes** (`window.__sehamLenis` when fine pointer) |
| Pilots armed (lab desktop) | — | hero / academy / about **true** when GSAP loaded |

Environment: local `http.server:8773`, Cursor embedded browser. **Physical devices not used.**

---

## 15. Regression testing results

| Area | Result |
|------|--------|
| AR homepage load + GSAP 3.12.7 | **Pass** — `__sehamMotion` initialized |
| EN homepage scripts | **Pass** (same structure, `../` paths) |
| Console errors on load | **None observed** (spot-check) |
| Drawer / gift / checkout | **Not re-tested** (untouched) |
| Viewport matrix 320–1920 | **Partial** (lab only) |
| GSAP blocked scenario | **Not automated** — architecture uses fail-safe visible() |

---

## 16. Remaining limitations

- Pilots limited to **homepage** and **desktop** width.
- Academy **upcoming cards** still CSS-driven (intentional).
- About **contour** stroke still CSS `ap-in` assist (not DrawSVG).
- No automated performance regression suite.
- Full-width desktop hero GSAP may overlap with future mobile-first hero work in Phase 04.
- GSAP license: standard GreenSock license applies to `gsap.min.js`; confirm compliance for production deployment.

---

## 17. Readiness for Phase 04 — The Rhythm of Motion

**Ready to begin creative choreography expansion** provided:

1. Re-run scroll glide + Web Vitals on target hardware after deploy.
2. Extend ownership map per section before migrating more CSS IOs.
3. Introduce ScrollTrigger only in a dedicated phase with clock strategy review.
4. Keep Arabic block-level animation discipline.

---

## Non-negotiable rules checklist

| Rule | Status |
|------|--------|
| No visual redesign | **Pass** |
| No full creative pass | **Pass** (3 pilots only) |
| No ScrollTrigger / SplitText / ScrollSmoother | **Pass** |
| Loader untouched | **Pass** |
| Mobile scroll preserved | **Pass** |
| No duplicated scroll controllers | **Pass** |
| No fabricated metrics | **Pass** |

---

*Phase 03 foundation complete. Next: Phase 04 bespoke choreography on this architecture.*