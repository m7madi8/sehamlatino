# Seham Latino — Performance Recovery Report

**Date:** 2025-11-27  
**Scope:** Homepage (AR/EN), `studio.js` scroll architecture, decorative motion stack  
**Ship target:** Responsive native scrolling in production; legacy motion available only on demand.

---

## Executive summary

Production homepages **no longer load Lenis, GSAP, or `seham-motion.js` by default.** Scrolling uses the **browser-native** path with a **single unified `IntersectionObserver` entrance lifecycle** in `studio.js`, lightweight CSS transitions, and decorative scroll-linked effects disabled under `html.motion-native`.

This removes the previous “triple engine” conflict: **Lenis RAF + native scroll listeners + GSAP/IO competing for the same sections** on every wheel tick.

**Lenis decision:** **Off in production.** Enable only via `?motion=legacy`, `?motion=lenis`, or isolation `?perf=D|E|…`.

**GSAP decision:** **Off in production.** Load dynamically via `?motion=legacy|gsap` or `?perf=C|E|…` for comparison—not shipped on first paint.

---

## Confirmed root causes (code-level)

| Issue | Mechanism | Recovery action |
|--------|-----------|-----------------|
| Scroll input lag | Lenis `autoRaf: false` loop + merged `updateChrome()` still adds work per glide frame; native `scroll` also fired on non-Lenis path | Lenis **default off**; one chrome RAF bus when Lenis is on |
| Competing visibility | `studio.js` IO + `seham-motion.js` GSAP `from({opacity:0})` + `.js-motion` hidden defaults | Removed GSAP from default HTML; IO ownership restored; GSAP skips duplicate nodes when loaded |
| Header jank | Animated signature + scroll-time layout (partially fixed earlier) | Signature animation **legacy only** (`?motion=legacy`) |
| Scroll-linked paint | `sg-silk` `animation-timeline: view()` | **Disabled** under `html.motion-native` (static silk preserved) |
| Hero parallax | `heroPicture` transform on scroll | **Legacy only** |
| Missing content risk | IO/GSAP race without failsafe | Kept 2.6s / 2.2s failsafes; no `opacity: unset` hacks |

---

## Final motion architecture (production)

```
Default (no query params)
├── html.motion-native
├── Native window scroll
├── studio.js: single IO bus (CSS entrances + sectional .is-in)
├── about-portrait.js on homepage (no GSAP deferral in native mode)
├── preloader / gift / functional JS unchanged
└── No vendor/gsap, no seham-motion, no Lenis

Legacy / debug
├── ?motion=legacy|full  → dynamic inject GSAP + seham-motion + Lenis (desktop fine pointer)
├── ?motion=gsap       → GSAP stack only
├── ?motion=lenis      → Lenis only
└── ?perf=A…H          → seham-perf-diag.js flags (synchronous, before studio.js)
```

---

## Isolation matrix (`?perf=`)

| Mode | Lenis | GSAP | CSS IO | Header sig anim | Notes |
|------|-------|------|--------|-----------------|-------|
| A | off | off | off | off | Pure baseline |
| B | off | off | on | off | CSS entrances only |
| C | off | on | on | on | Dynamic GSAP load |
| D | on | off | on | on | Lenis-only |
| E | on | on | on | on | Former “full” stack |
| F–H | per diag | per diag | per diag | per diag | Video / decor / paint hooks |

`seham-perf-diag.js` now runs **synchronously** from `<head>` (no async race with `defer` studio.js).

---

## Measurements (lab — embedded browser, programmatic scroll)

**Method:** `scrollTo` stepped 2400px + 240-frame rAF inter-arrival sampling (not real wheel/trackpad).  
**Viewport:** Cursor embedded browser (automation, `pointer: fine` may differ from user desktop).

| Profile | Lenis | GSAP | avg ms | median ms | p95 ms | frames >32ms |
|---------|-------|------|--------|-----------|--------|----------------|
| **Production default** | no | no | 20.78 | 16.7 | 16.8 | 1 |
| **?perf=A** | no | no | 20.73 | 16.7 | 16.8 | 1 |
| **?perf=D** | yes | no | *(similar band)* | ~16.7 | ~16.8 | 1 |
| **?perf=E** | yes | yes | 20.82 | 16.7 | 16.8 | 1 |

**Interpretation:** Programmatic scroll does **not** exercise Lenis wheel smoothing or GSAP ticker load the way a **physical wheel** does. Median frame spacing looks healthy in automation; **worst-frame spikes (~1s)** likely reflect navigation/layout in the test harness, not sustained scroll jank.

**Required for sign-off:** Chrome DevTools Performance recording during **manual wheel** scroll on a fine-pointer desktop at 390 / 768 / 1440px, AR + EN, before vs after—compare long tasks and `scroll` handler duration.

---

## Removed / gated from default homepage load

- `vendor/gsap.min.js` (AR/EN `index.html`)
- `seham-motion.js` + `seham-motion.css` (static tags)
- Lenis (no longer initialized without profile/perf flag)
- Hero scroll parallax
- Header signature transition choreography
- Scroll-linked silk drift (`view()` timeline)

Files remain in repo for `?motion=legacy` and QA.

---

## Modified files

| File | Change |
|------|--------|
| `seham-studio/index.html` | `motion-native` boot; removed GSAP/motion CSS/JS; cache `perf-recovery-1`; sync perf diag |
| `seham-studio/en/index.html` | Same |
| `seham-studio/studio.js` | `MOTION_PROFILE`, Lenis/GSAP gating, IO restore, dynamic legacy loader |
| `seham-studio/studio.css` | `html.motion-native .sg-silk` — no scroll-linked animation |
| `seham-studio/seham-perf-diag.js` | Correct A–E isolation mapping; strip `motion-native` when testing full stack |

---

## Visual / functional regression (automated smoke)

- **Homepage AR** (`index.html?v=perf-recovery-1`): All major regions present in accessibility snapshot (hero, academy, freedom, about, services, gift, footer).
- **`motion-native`:** true in production; **Lenis:** false; **GSAP script:** false.
- **Academy** `.is-in` applied; **opacity-0 cards:** 0 in programmatic traversal.
- **?perf=E:** Lenis + GSAP inject after load confirmed.

Not verified in this pass: checkout, library, lesson player, gift modal keyboard trap, every inner page locale—manual checklist recommended.

---

## Video

Existing stabilization retained: poster + dual IO prep/play in `studio.js` (second IIFE). No decorative timeline gates video arm.

---

## Remaining blockers / honesty

1. **Real wheel/trackpad profiling** on target hardware—not replaceable by `scrollTo` benchmarks above.
2. **GSAP desktop choreo** in embedded automation often inactive without `(pointer: fine)` + loaded stack; production no longer depends on it.
3. **Inner pages:** Confirm they never pulled homepage-only motion (grep shows GSAP only on preview HTML; studio.js is shared—native profile benefits all pages using it).
4. If stakeholders want **rich GSAP entrances** back without Lenis: use `?motion=gsap` in QA; only ship to production after wheel profiling passes.

---

## How to test locally

```text
cd seham-studio
python -m http.server 8773
```

- Production: `http://127.0.0.1:8773/index.html`
- Baseline: `?perf=A`
- CSS only: `?perf=B`
- Legacy stack: `?motion=legacy` or `?perf=E`

Paste `tools/scroll-frame-bench.js` in DevTools while **manually** scrolling for user-realistic sampling.

---

## Success criteria alignment

| Criterion | Status |
|-----------|--------|
| No redesign | Yes — layouts/assets/copy unchanged |
| No new libraries | Yes |
| Simplify architecture | Yes — single scroll + single IO owner in production |
| Content visible by default | Yes — failsafes + no GSAP opacity fight on first paint |
| Responsive scrolling | **Architecturally addressed**; confirm on real wheel |
| Refined motion | CSS entrances in production; GSAP opt-in only |

**Performance is part of luxury:** shipping native scroll first is intentional; motion is opt-in until measured safe on desktop wheel input.