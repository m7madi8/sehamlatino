# SCROLL PERFORMANCE ENGINEERING REPORT

**Project:** Seham Latino Dance Academy  
**Motion:** rhythm-3 (scroll performance pass)  
**Date:** 2026-11-27  

---

## Executive summary

User-reported scroll lag at **section boundaries** was traced to **main-thread work stacking** on the same frames—not a single library failure. Confirmed contributors:

1. **Dual scroll RAF buses** — Lenis `raf` + separate `scroll` → `requestAnimationFrame(updateChrome)` duplicated per-frame work while gliding.
2. **Header chapter selection** — `getBoundingClientRect()` on every visible section after each chapter `IntersectionObserver` batch (layout thrash at boundaries).
3. **Duplicate entrance systems** — Legacy sectional/reveal `IntersectionObserver` + GSAP `observeOnce` on the same sections (academy, curated, freedom, final CTA).
4. **GSAP tween density** — Academy timeline fired **10+ overlapping tweens** (each targeting layout-affecting opacity/transform).
5. **Academy video** — `tryPlay()` + `load()` could align with academy entrance IO on first intersection.

**rhythm-3** + **studio.js scroll-perf-1** address these with measured isolation hooks (`?perf=A–H`), without changing approved design.

**Lab limitation:** Embedded automation does **not** match `(pointer: fine)`; GSAP pilot does not run there. **Real desktop wheel/trackpad profiling is still required.**

---

## 1. Confirmed root causes

| ID | Cause | Evidence |
|----|--------|----------|
| R1 | Lenis + chrome double RAF | Code: `lenis.on("scroll", onScroll)` scheduled second RAF while Lenis loop already running |
| R2 | Header layout reads | Code: `pickActive()` called 2× `getBoundingClientRect` per visible chapter per IO flush |
| R3 | Observer duplication | Code: `studio.js` sectional + reveal IO + `seham-motion.js` section IO on same DOM |
| R4 | GSAP concurrency | Code: rhythm-2 academy had 10+ `from()` tweens with negative overlap |
| R5 | Video + entrance collision | Code: academy video IO thresholds fire `tryPlay` on same boundary as motion |
| R6 | Signature transitions | Code: `offsetWidth` read + 760ms timed transition on chapter change |

**Not confirmed as primary in lab:** silk CSS animation, backdrop-filter alone (no isolated regression in automation; Test H scaffold only).

---

## 2. Controlled isolation tests (`?perf=`)

Harness: `seham-perf-diag.js` (homepage only). Sets `window.__sehamPerfDiag`.

| Test | Config | Purpose |
|------|--------|---------|
| **A** | Native scroll, no Lenis, no GSAP, no hero parallax | Baseline main thread |
| **B** | Lenis on, GSAP off | Lenis cost only |
| **C** | GSAP on, Lenis off | GSAP + native scroll |
| **D** | Full stack | Production-like (minus fine-pointer GSAP in lab) |
| **E** | Full + video disabled | Media decode isolation |
| **F** | Full + header signature instant | Header transition isolation |
| **G** | Full + no hero parallax | Decorative scroll cost |
| **H** | Full + paint isolate flag | Reserved for filter/mask experiments |

### Lab results (programmatic scroll, ~300 rAF samples, AR homepage)

**Environment:** Cursor embedded browser, ~1440px, **not** fine-pointer GSAP.

| Test | Lenis | GSAP | avg ms | p95 ms | frames >32ms |
|------|-------|------|--------|--------|----------------|
| A | off | off | 16.63 | 16.80 | 0 |
| B | on | off | *(single run)* | — | — |
| D | on | off* | 16.61 | 16.80 | 0 |

\*GSAP pilot inactive without `pointer: fine`.

**Interpretation:** Programmatic `scrollTo` stepping does **not** reproduce user wheel input or Lenis glide compositing. Numbers are **not** proof of fixed production lag; they validate that **double RAF removal** does not regress idle frame pacing in automation.

**User validation:** Run the same URLs on Chrome desktop with Performance panel + real wheel through Hero→Academy→Testimonials.

---

## 3. Flame-chart / pipeline findings (architectural)

| Subsystem | Per scroll frame (before) | After scroll-perf-1 |
|-----------|---------------------------|---------------------|
| Lenis | 1× `lenis.raf` | unchanged |
| Chrome bus | +1× RAF from scroll event | **Merged into Lenis loop** |
| GSAP ticker | Active during entrances | `autoSleep: 90`, fewer tweens |
| Chapter IO | → RAF → N× layout reads | **90ms debounce**, **intersectionRatio** pick, **no getBoundingClientRect** |
| Legacy IO | Always on academy/curated | **Skipped when GSAP desktop will run** |
| Video | sync `tryPlay` | **`requestIdleCallback` / 120ms defer** |

---

## 4. Section boundary bottleneck map

| Boundary | Concurrent work (typical desktop) | Mitigation |
|----------|-----------------------------------|------------|
| Hero → Academy | Lenis, chrome, chapter swap, academy GSAP, video arm | Unified RAF; debounced chapter; leaner academy TL; idle video |
| Academy → Testimonials | GSAP testimonials + chapter + legacy failsafes | Skip duplicate legacy IO; fast-scroll settle |
| Testimonials → About | GSAP about + portrait CSS | Single about timeline (3 targets) |
| About → Services | curated GSAP + 3 cards | Card stagger only (no per-img GSAP) |
| Services → Gift | gift TL + silk CSS (static anim) | Copy block single tween |
| Gift → Final CTA | final CTA + chapter | GSAP owns reveal-line |
| Final CTA → Footer | chapter footer + header | ratio-based pick + hysteresis (`lastPickKey`) |

---

## 5. RAF / ticker architecture

- **Lenis:** still single instance; `lerp: 0.092` unchanged.
- **Chrome:** `updateChrome()` runs **once per Lenis RAF frame** when gliding; native scroll path unchanged.
- **GSAP:** no ScrollTrigger; `gsap.config({ autoSleep: 90, force3D: true })`.
- **Not adopted:** `gsap.ticker` + Lenis merge — insufficient lab evidence of gain; revisit if Chrome trace shows idle ticker cost.

---

## 6. GSAP optimizations (rhythm-3)

| Change | Detail |
|--------|--------|
| Academy | 10+ tweens → **5 groups** (intro, flagship, copy stagger, upcoming, soon) |
| Testimonials | 4 tweens → portrait + **copy stagger** |
| Gift | 4 copy tweens → **single `.sg-copy` block** |
| Fast scroll | `scrollSpeed > 2.6 px/ms` → legacy unlock only, **no timeline** |
| Observers | `unlockSectionLegacy` before choreo; disconnect after fire |

---

## 7. IntersectionObserver optimizations

- Desktop GSAP path: **no** legacy sectional IO for `.academy` / `.curated`.
- **No** legacy reveal IO for `.freedom-inner` / `.final-cta` when GSAP desktop will run.
- Chapter observer: multi-threshold **ratio map**; debounced pick (90ms).
- GSAP `observeOnce`: still single-fire with 2.6s failsafe.

---

## 8. Header optimizations

- Removed per-pick **geometry reads**.
- **Hysteresis:** `lastPickKey` prevents duplicate signature animation.
- Test **F:** instant copy swap (`headerSig: false`).

---

## 9. Video performance

- `tryPlay()` deferred via `requestIdleCallback` (400ms timeout) or 120ms timeout.
- Test **E:** `video: false` skips play on intersection.
- Poster / lazy source behavior unchanged.

---

## 10. CSS / paint

- No approved visuals removed.
- Existing comment in `studio.css` already avoids global `will-change` on scroll props.
- Silk drift remains CSS-only (`sg-silk`); Test **G** disables hero parallax only.

---

## 11. Before / after measurements

| Metric | rhythm-2 (inferred) | rhythm-3 + scroll-perf-1 (lab) |
|--------|---------------------|--------------------------------|
| Academy concurrent tweens | ~10 | ~5 groups |
| Chrome RAF while Lenis gliding | 2× potential | 1× |
| Chapter layout reads per IO | O(sections) | 0 |
| Legacy duplicate IO (desktop GSAP) | yes | no |

Frame times: **see §2** — not comparable to user hardware until real profiling.

---

## 12. Modified files

| File | Role |
|------|------|
| `seham-studio/studio.js` | Lenis/chrome bus, chapter pick, IO dedupe, video defer, perf diag |
| `seham-studio/seham-motion.js` | rhythm-3 choreography + fast-scroll scheduling |
| `seham-studio/seham-perf-diag.js` | Isolation tests A–H |
| `seham-studio/tools/scroll-frame-bench.js` | DevTools console frame sampler |
| `seham-studio/index.html`, `en/index.html` | perf script, cache bust |

---

## 13. Desktop / mobile results

| Platform | Status |
|----------|--------|
| Desktop 1024–1920, real pointer | **NOT VERIFIED** (GSAP + wheel) |
| Lab programmatic scroll | Stable ~16.6ms avg (see caveats) |
| Mobile native scroll | **NOT VERIFIED** (touch device) |

---

## 14. Visual regression

- Fail-open unlocks preserved from rhythm-2.
- Fast-scroll path: instant visible state, no hidden cards.
- Full `?perf=A` scroll: **0** stuck opacity on spot-check targets (lab).

---

## 15. Remaining blockers

1. **Production confirmation** with Chrome Performance recording during **wheel** scroll at 1440px (AR + EN).
2. Compare **?perf=B** vs **?perf=D** on user machine — if D alone spikes, GSAP density still needs tuning.
3. Optional: profile **backdrop-filter** on sticky header at section boundaries (Test H extension).

---

## 16. How to profile locally

```text
# Server (PowerShell)
cd seham-studio
python -m http.server 8773

# Pages
http://localhost:8773/index.html?perf=A
http://localhost:8773/index.html?perf=D
```

In Chrome DevTools → Performance: record, wheel-scroll full homepage, inspect **Long Tasks** and **Recalculate Style** at Academy entry.

Paste `tools/scroll-frame-bench.js` in console while scrolling for rAF delta stats.

---

**Verdict:** Engineering fixes are **in repo** and **architecturally justified**; user-reported lag is **not closed** until fine-pointer desktop wheel profiling confirms improvement.

**SEHAM LATINO — THE RHYTHM OF MOTION**