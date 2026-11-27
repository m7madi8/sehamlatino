# Seham Latino — Creative Motion Direction Report (Phase 04)

**THE RHYTHM OF MOTION**  
Date: 27 November 2026  
Scope: Homepage choreography (`index.html`, `en/index.html`)  
Foundation: `seham-motion.js` v **rhythm-1** · GSAP **3.12.7** (core only)

---

## 1. Creative motion concept

Motion is choreographed as **editorial dance**: each section enters once, with **asymmetric timing** and **layered rhythm** rather than identical fade-ups. The language expresses grace, confidence, and quiet luxury through **opacity + restrained vertical travel** only—no scale drama, no scroll hijacking, no character splitting.

**Pillars:** cinematic openings · feminine editorial pacing · organic asymmetry · commercial clarity (Academy CTAs never blocked).

---

## 2. Phase 03 validation (pre–Phase 04)

| Check | Result |
|-------|--------|
| GSAP 3.12.7 local load | **Pass** |
| Desktop ≥761px gate | **Pass** after ctx TDZ fix |
| Phase 03 pilots (hero, academy, about) | **Superseded** by rhythm choreography |
| Bug found | `gsap.context` callback referenced `ctx` before initialization → **fixed** |
| GSAP load race | **Mitigated** with deferred `load` retry before fail-safe |

**Historical scroll baseline (audit, not re-measured as new):** 103 frames · ~16.5 ms avg · 17 ms worst · 0 long tasks.

---

## 3. Motion language and tokens

Defined in `seham-motion.js` (`TOKENS`):

| Token | Value | Role |
|-------|-------|------|
| `easePrimary` | `power3.out` | Academy, services |
| `easeSoft` | `power2.out` | Testimonials, about, final CTA |
| `easeEditorial` | `power4.out` | Hero, gift |
| `text` / `textShort` | 0.78 / 0.68 s | Typography |
| `media` | 0.92 s | Portrait blocks |
| `stagger` / `staggerTight` | 0.08 / 0.06 s | Sequences |
| `yHero` / `yText` / `ySoft` / `yWhisper` | 20 / 16 / 12 / 8 px | Travel |

---

## 4. Section-by-section choreography

| Section | Creative intent | GSAP targets | Notes |
|---------|-----------------|--------------|-------|
| **Hero** | Campaign opening | `h1` → lede → actions (overlapping timeline) | After loader / `is-cinema-entered`; photo untouched |
| **Academy** | Editorial feature | Display → lead → status → title → level+desc → specs → commerce | Asymmetric overlaps; video card not GSAP-animated |
| **Testimonials** (`.freedom`) | Intimate narrative | Portrait still → manifesto → voices shell → active quote only | Slider logic untouched; no re-entrance on slide change |
| **About** | Artist profile | `.ap-photo` → `.ap-title` → `.ap-bio` | Whole Arabic headings; `ap-in` for contour stroke |
| **Services** (`.curated`) | Luxury collection | Section `h2` → `.xp` cards staggered | 0.08 s stagger |
| **Gift** (`.sg`) | Invitation | `.sg-photo` then copy stack (kicker, title, desc, CTA) | **No** transform on `.sg-silk` (CSS drift preserved) |
| **Final CTA** | Closing gesture | `h2` → `.cta-actions` | Footer below remains static |
| **Footer** | Rest | — | No choreography added |

---

## 5. Animation ownership changes

| Region | Previous owner | Phase 04 owner |
|--------|----------------|----------------|
| Hero copy (desktop) | CSS mobile cinema / visible desktop | **GSAP** `choreoHero` |
| Academy intro + flagship body | CSS `.js-motion` + `.is-in` | **GSAP** (+ CSS failsafe on upcoming cards) |
| Freedom `.reveal-line` | `studio.js` IO + CSS | **GSAP** claims via `sm-choreo-claim`; IO still adds `is-visible` to avoid stuck hidden |
| About desktop | `about-portrait.js` | **GSAP** (`about-portrait.js` exits when `data-seham-motion` present) |
| About mobile | `about-portrait.js` | **Unchanged** |
| Curated cards | CSS sectional `.is-in` only | **GSAP** entrance (`.is-in` unchanged for layout) |
| Gift silk drift | CSS view timeline | **Unchanged** |
| Gift modal | `gift-experience.js` | **Unchanged** |
| Chapter / video / purchase bar IO | `studio.js` | **Unchanged** |
| Lenis | `studio.js` | **Unchanged** |

**Property rule:** GSAP uses **opacity + translateY** only on listed semantic nodes.

---

## 6. Modified files

| File | Change |
|------|--------|
| `seham-studio/seham-motion.js` | Full choreography + ctx fix + GSAP load retry |
| `seham-studio/seham-motion.css` | Ownership guards for academy, about, reveal-line claims |
| `seham-studio/index.html` | Cache `?v=rhythm-1` |
| `seham-studio/en/index.html` | Cache `?v=rhythm-1` |

**Not modified:** `studio.js`, `studio.css` layout, `gift-experience.*`, loader, `vendor/lenis.min.js`, no new dependencies.

---

## 7. Preserved CSS animations

- Mobile hero `heroCinemaCopy` (≤760px)
- Academy upcoming / `.academy-soon` CSS transitions
- Gift `.sg-silk` scroll-linked drift (fine pointer)
- Closing silk canvas CSS transforms on `.closing-canvas.is-in`
- Freedom quote **slide** transitions on testimonial change
- All hover / focus button transitions
- `prefers-reduced-motion` global kill blocks in `studio.css`

---

## 8. GSAP timelines (desktop)

| ID | Triggers | Replays |
|----|----------|---------|
| `choreoHero` | Hero ready | No |
| `choreoAcademy` | `.academy` in view once | No |
| `choreoTestimonials` | `.freedom` in view once | No |
| `choreoAbout` | `.about-portrait` in view once | No |
| `choreoServices` | `.curated` in view once | No |
| `choreoGift` | `.sg` in view once | No |
| `choreoFinalCta` | `.final-cta` in view once | No |

**Estimated active entrance timelines per full homepage pass:** up to **7** (one-shot each).

---

## 9. Desktop strategy

- **Gate:** `(min-width: 761px) and (prefers-reduced-motion: no-preference)` via `gsap.matchMedia`.
- Single centralized module; shared `observeOnce` helper (deduped with `data-sm-seen`).
- No ScrollTrigger; no perpetual ticker merge with Lenis.

---

## 10. Mobile strategy

- **No GSAP choreography** below 761px on homepage.
- Existing CSS entrances + `about-portrait.js` remain authoritative.
- Native touch scroll; Lenis `syncTouch: false` unchanged.

---

## 11. Arabic typography protection

- Animations target **`.ap-title`**, **`.freedom-title`**, headings, paragraphs as whole nodes.
- **No SplitText**; no per-character spans.
- RTL/LTR direction unchanged; LTR English homepage uses same choreography selectors.

---

## 12. Accessibility results

| Case | Behavior |
|------|----------|
| `prefers-reduced-motion: reduce` | No timelines; `failSafeVisible()` |
| GSAP missing after `load` | Fail-safe visible content |
| Fast scroll | `observeOnce` + studio.js failsafe timers on `.academy` / `.curated` |
| Keyboard / dialog / gift modal | Untouched |

---

## 13. Performance measurements

| Metric | Result |
|--------|--------|
| GSAP bytes | 72,304 |
| `seham-motion.js` | 13,885 bytes |
| 2,400px scroll glide | **NOT RE-MEASURED** (historical audit reference only) |
| FCP / LCP / CLS / INP | **NOT MEASURED** |
| Long tasks during load | **NOT MEASURED** |

**Lab validation (embedded Chrome, 1440×900, after ctx fix):**

- `sm-gsap-pilot` active
- `__sehamMotion.version` = `rhythm-1`
- On load: **`hero: true`**, **`academy: true`** (in-view)
- Scroll-triggered sections (freedom, about, curated, gift, final CTA): **NOT fully verified in automated scroll** (native `scrollTo` did not register all IO callbacks in lab); **manual desktop QA recommended**

Viewports **1024px** and **1920px**: **NOT individually re-tested in this pass** (same emulation family as 1440).

---

## 14. Functional regression results

| Area | Status |
|------|--------|
| GSAP init after bugfix | **Pass** |
| Console errors on load | **None observed** (post-fix) |
| Lenis present (fine pointer lab) | **Yes** |
| AR homepage structure | **Unchanged** |
| EN homepage | **Same script bundle** |
| Gift modal / drawer / video | **Not re-tested** (no code changes) |
| Physical devices | **NOT TESTED** |

---

## 15. Remaining limitations

- Automated scroll IO verification incomplete for below-fold sections in lab.
- Academy **upcoming** grid still CSS-driven (intentional).
- About **contour** stroke still completed via CSS class `ap-in`, not GSAP DrawSVG.
- No course / library page choreography in this phase.
- Micro-interactions: **no GSAP changes** (CSS hovers retained per brief).

---

## 16. Final readiness verdict

**Phase 04 homepage creative direction is implemented** for desktop: coherent rhythmic entrances across hero → academy → testimonials → about → services → gift → final CTA, with visual design locked and functional observers preserved.

**Recommended before public release:**

1. Manual pass at **1024 / 1440 / 1920** AR + EN (slow + fast scroll).
2. Repeat **2,400px Lenis glide** and compare to historical 103-frame baseline.
3. Confirm gift silk and modal on real hardware.

**ScrollTrigger / full-site expansion:** defer to a future phase with explicit clock strategy review.

---

## Non-negotiable rules checklist

| Rule | Status |
|------|--------|
| No redesign / layout / typography change | **Pass** |
| No ScrollTrigger / ScrollSmoother / SplitText | **Pass** |
| No new dependencies | **Pass** |
| Lenis preserved | **Pass** |
| No fabricated performance metrics | **Pass** |
| Footer predominantly static | **Pass** |
| Gift modal unchanged | **Pass** |

---

*Luxury is precision, not excess. The homepage now moves with intentional rhythm—ready for your eyes on real desktop viewports.*