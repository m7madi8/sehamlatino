# Seham Latino — Final Motion QA Report (Phase 05)

**THE RHYTHM OF MOTION** · `seham-motion.js` **rhythm-1**  
Date: 27 November 2026  
Scope: Homepage AR + EN (`index.html`, `en/index.html`)

---

## 1. Executive summary

Phase 05 **verified and corrected** the motion stack. The **Phase 04 `gsap.context()` temporal dead zone (TDZ)** was present in the repo (`state.contexts.push(ctx)` inside the context callback). **rhythm-1** now pushes the context **after** creation, includes full homepage choreography, fine-pointer gating, GSAP **load retry** via `whenGsapReady`, and **single-boot** guards (`BOOTED` + `booting`).

**Lab desktop validation (1440×900, fine pointer, post-fix):** all **7** section timelines executed after a full scroll pass; **no** `sm-gsap-fallback`; GSAP **3.12.7**; Lenis present.

**Scroll glide:** one embedded-browser sample was captured (see §7). It is **not** equivalent to the historical 441×952 audit and **must not** replace it for production sign-off.

**Verdict:** **Conditionally production-ready** for homepage motion on **real desktop** QA (1024 / 1440 / 1920 AR+EN) and a **repeat of the historical Lenis glide** on target hardware. Embedded lab scroll metrics alone are **insufficient** for final performance acceptance.

---

## 2. GSAP initialization verification

| Check | Result |
|-------|--------|
| TDZ in `gsap.context` | **Fixed** — `state.contexts.push(ctx)` moved outside callback |
| `window.__sehamMotion.version` | **`rhythm-1`** |
| GSAP local file | **`vendor/gsap.min.js`** 3.12.7 (72,304 B) |
| Runtime CDN dependency | **None** |
| Duplicate `boot()` on `window.load` | **Mitigated** — `booting` + `BOOTED` |
| GSAP late load | **`whenGsapReady`** (≤50 × 32 ms) then init; else `failSafeVisible()` |
| Fail-safe false positive after init | **Not observed** in lab (`sm-gsap-fallback`: false) |
| Duplicate contexts | **Single** `gsap.context` per successful boot |
| `destroy()` / reduced motion | Reverts context + clears observers |

**Important:** `sm-gsap-pilot` on `<html>` confirms **eligibility**, not that a timeline **ran**. Validation uses `__sehamMotion.state.sections` and timeline count.

---

## 3. Section-by-section motion validation

**Environment:** `http://127.0.0.1:8773/index.html` · 1440×900 emulation · after ~2.2 s (post-loader).

| # | Section | `state.sections.*` | Trigger | Notes |
|---|---------|---------------------|---------|-------|
| 01 | Loader → hero | `hero: true` | `is-cinema-entered` + `seham:preload-done` | Headline/lede/CTA sequence; photo untouched |
| 02 | Hero typography | ✓ | GSAP overlapping timeline | h1 → lede → actions |
| 03 | Academy | `academy: true` | `observeOnce` on `.academy` | Asymmetric overlaps; video IO unchanged |
| 04 | Testimonials | `testimonials: true` | `.freedom` | Portrait + manifesto + voices + **active** quote only |
| 05 | About | `about: true` | `.about-portrait` | `.ap-photo` → `.ap-title` → `.ap-bio`; `ap-in` for contour |
| 06 | Services | `services: true` | `.curated` | Heading + `.xp` stagger 0.08 s |
| 07 | Gift | `gift: true` | `.sg` | Photo then copy; **no** `.sg-silk` transform |
| 08 | Final CTA | `finalCta: true` | `.final-cta` | h2 + actions |
| 09 | Footer | — | Static | No GSAP (by design) |

**After full scroll to ~8000 px:** `state.timelines === 7`; `data-sm-seen` on academy, freedom, about-portrait, curated, sg, final-cta.

**Not fully automated:** gift modal, drawer, testimonial **slide** changes, academy video tap-to-play, EN copy pass at 1024/1920 (same code paths).

---

## 4. Motion timing refinements (Phase 05)

| Refinement | Rationale |
|------------|-----------|
| Hero waits on `seham:preload-done` when loader active | Cleaner handoff; avoids racing loader |
| Overlapping hero timeline (`-=0.42`, `-=0.34`) | Editorial rhythm vs uniform stagger |
| Academy asymmetric overlaps | Commercial hierarchy (title before commerce) |
| Fine-pointer gate in `matchMedia` | Wide touch tablets do not get desktop GSAP |
| `booting` flag | Prevents double init on `load` |
| About targets **`.ap-title`** (not `.ap-name`) | Matches live markup |

No Lenis parameter changes (`lerp: 0.092` preserved).

---

## 5. Lenis evaluation

| Item | Status |
|------|--------|
| Version / options | **1.1.20** · `lerp: 0.092` · `syncTouch: false` · unchanged |
| Second instance | **None** (`__sehamLenis` singleton) |
| GSAP ticker merge | **Not introduced** |
| Touch/mobile | Native scroll preserved |

**Subjective scroll QA** (trackpad, wheel, keyboard, anchors, drawer lock): **NOT executed** on physical hardware in this pass.

---

## 6. Section boundary performance

**Observed (lab):** Seven one-shot timelines across a single downward pass; no ScrollTrigger measurement loops; silk remains CSS view-timeline.

**Not measured:** paint/layout breakdown per boundary, simultaneous long tasks with academy video decode, header signature paint overlap.

**Risk note:** Fast scroll into Gift + Final CTA can activate two timelines within ~400 ms; both are opacity/translate only. No change applied; monitor on real GPU.

---

## 7. Actual scroll frame measurements

### Historical reference (pre-GSAP audit — **not re-run as authority**)

| Metric | Audit reference |
|--------|-----------------|
| Viewport | 441×952 |
| Distance | ~2400 px glide |
| Frames | 103 |
| Avg frame | ~16.5 ms |
| Worst frame | 17 ms |
| Long tasks | 0 |

### Phase 05 lab measurement (post-GSAP — **limited comparability**)

| Metric | Value | Conditions |
|--------|-------|------------|
| Viewport | 1440×900 emulated | Embedded Cursor browser |
| Method | `scrollTo` 0→2400 over ~2.6 s; rAF deltas | Lenis object present; glide path **not verified** |
| Frame samples | **62** | |
| Avg delta | **33.33 ms** | |
| Median | **33.3 ms** | |
| P95 | **33.5 ms** | |
| Worst | **33.6 ms** | |
| Long tasks | **NOT MEASURED** | PerformanceObserver not attached |

**Blocker for audit-equivalent glide:** no controlled 441×952 + confirmed Lenis `scrollTo(2400, { duration: 2.4 })` trace in this harness.

**LCP / CLS / FCP / INP:** **NOT MEASURED**

---

## 8. Before-and-after comparisons

| Aspect | Phase 03 (`pilot-1` in repo before fix) | rhythm-1 after Phase 05 |
|--------|----------------------------------------|-------------------------|
| Context init | **TDZ risk** | **Stable** |
| Sections covered | 3 pilots | **7 choreographies** |
| About markup | Wrong `.ap-name` selector | **`.ap-title`** |
| Pointer gate | Width only | **Width + fine pointer** |
| `seham-motion.js` | ~7.3 KB | **13,582 B** |

---

## 9. Desktop testing

| Width | Automated | Result |
|-------|-----------|--------|
| 1024px | **No** | Manual recommended |
| 1440px | **Yes** | All sections `true`; 7 timelines |
| 1920px | **No** | Manual recommended |

---

## 10. Mobile testing

| Width | GSAP choreography | Owner |
|-------|---------------------|--------|
| ≤760px | **Disabled** | CSS + `about-portrait.js` |
| 320–430px | **NOT TESTED** in lab | — |

---

## 11. Arabic and English validation

| Check | AR | EN |
|-------|----|----|
| GSAP block-level animation | **Pass** (lab AR) | Same bundle (`../`) — **not re-loaded in lab** |
| SplitText / char split | **None** | — |
| RTL | Document `dir` preserved | LTR on `en/` |

---

## 12. Accessibility testing

| Case | Result |
|------|--------|
| `prefers-reduced-motion` | `failSafeVisible()`; CSS force-visible in `seham-motion.css` |
| GSAP blocked | Fail-safe selectors cover choreographed nodes |
| Runtime preference change | `destroyAll` on `reduceMq` change |
| Keyboard / dialogs | **Not re-tested** (no logic change in `studio.js` / gift) |

---

## 13. Functional regression testing

| Feature | Status |
|---------|--------|
| Header / drawer | **Not re-tested** |
| Gift modal | **Not re-tested** |
| Testimonial nav | **Not re-tested** (entrance once only ✓) |
| Academy video | **Not re-tested** |
| Checkout links | **Visible in snapshot** |
| Course purchase bar | N/A on homepage |

---

## 14. Visual regression testing

| Area | Result |
|------|--------|
| Layout / typography / color | **No intentional CSS/layout edits** in Phase 05 |
| Final resting state | GSAP uses `clearProps: transform` on hero; opacity settles at 1 |
| Silk / gift modal | **Unchanged** (CSS drift only) |

**Screenshot comparison:** **NOT CAPTURED** in this pass.

---

## 15. Modified files (Phase 05)

| File | Change |
|------|--------|
| `seham-studio/seham-motion.js` | Full rhythm-1 choreography; TDZ fix; boot guards; fine-pointer gate |
| `seham-studio/seham-motion.css` | Ownership guards + reveal-line claims |
| `seham-studio/index.html` | Cache `?v=rhythm-1` |
| `seham-studio/en/index.html` | Already `rhythm-1` |

**Unchanged:** `studio.js`, Lenis vendor, loader, `gift-experience.*`, no new dependencies.

---

## 16. Remaining limitations

- Performance sign-off requires **manual** 1024 / 1920 + **historical-comparable** Lenis glide.
- Lab scroll metrics **~33 ms** deltas likely reflect embedded browser / display timing, **not** a proven regression vs 16.5 ms audit.
- Physical phones/tablets not tested.
- Functional matrix (modal, drawer, BFCache) incomplete in automation.

---

## 17. Remaining blockers

| Blocker | Severity |
|---------|----------|
| No audit-equivalent 441px Lenis glide after GSAP | **High** for performance sign-off |
| No LCP/CLS/INP suite | **Medium** |
| No AR+EN physical device pass | **Medium** |

---

## 18. Final motion production-readiness verdict

| Criterion | Status |
|-----------|--------|
| GSAP init / TDZ fixed | **Pass** |
| All 7 section entrances execute (desktop lab) | **Pass** |
| No duplicate init (guarded) | **Pass** |
| Fine-pointer + width gate | **Pass** |
| Lenis untouched | **Pass** |
| No ScrollTrigger / new deps | **Pass** |
| Performance vs historical baseline | **NOT PASSED** (incomplete measurement) |
| Full functional QA | **NOT PASSED** (incomplete) |

**Overall:** **Ready for stakeholder desktop review**; **not fully signed off** for performance until historical glide is repeated under documented conditions.

---

*Luxury is precision, not excess. Motion now has rhythm-1 in code—not only on paper.*