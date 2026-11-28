# Seham Latino — Phase 02 Performance Optimization Report

Date: 27 November 2026  
Scope: `seham-studio/` (Arabic root + `en/`)  
Reference audit: `MOTION_PERFORMANCE_AUDIT.md` (unchanged)

---

## 1. Executive summary

Phase 02 removes the production delivery of a **49.5 MB** course hero JPEG, compresses the mobile homepage hero to **~36–83 KB** WebP candidates, externalizes duplicate footer silk (**~95 KB saved from CSS** plus one **17.9 KB** asset per page), and tightens academy video loading without changing art direction, Lenis, or animation ownership.

**GSAP / ScrollTrigger:** not installed. **Lenis 1.1.20:** unchanged in behavior and configuration.

---

## 2. Issues verified from the original audit

| ID | Audit claim | Re-verification (27 Nov 2026) |
|----|-------------|-------------------------------|
| **M-01** | `img/dscf9871-hero.jpg` 51,907,287 B; `fetchpriority="high"` on course pages | File size and dimensions confirmed; both `online-course.html` files referenced `.jpg` before fix |
| **M-02** | `img/hero-phone.png` 1,840,452 B; selected ≤760px | Confirmed in `index.html`, `en/index.html`, and mobile CSS background |
| **M-03** | Footer silk base64 **4×** in `studio.css` (~293 KB file) | `UklGRgBGAAB…` found **4** times at lines ~8422–8444; replaced with external asset |
| **M-04** | `bachata-lady-style.mp4` lazy via IO; `preload="none"` + `data-src` | Confirmed in HTML + `studio.js` ~993–1113 |
| **M-09** | Heavy unused files on disk | No references under `seham-studio/` HTML/CSS/JS (see §9) |
| **Lenis** | Single instance, `lerp: 0.092`, `syncTouch: false` | Not modified except adjacent video block in same file |

---

## 3. Issues resolved

- **M-01:** Responsive WebP derivatives + `srcset`/`sizes`; original JPEG retained on disk, no longer linked in production HTML.
- **M-02:** WebP `srcset` for mobile `<picture>` + CSS background WebP; PNG retained as WebP fallback `<source>`.
- **M-03:** Extracted rendered silk to `img/sl-footer-silk.webp`; four base64 URLs → one external URL (cascade/media blocks preserved).
- **M-04:** Deferred `video.load()` until play attempt; removed eager `preload="auto"`; stricter in-view ratios on narrow/coarse viewports; save-data / reduced-motion no longer arms source on scroll; **tap/keyboard to unlock** on coarse mobile.

**Not changed (per brief):** backdrop-filter stack, font files, loader timing/geometry, GSAP, Lenis version, section motion observers.

---

## 4. Modified files

| File | Change |
|------|--------|
| `seham-studio/online-course.html` | Course hero → WebP `srcset`, intrinsic 1920×2560 |
| `seham-studio/en/online-course.html` | Same (relative `../img/…`) |
| `seham-studio/index.html` | Mobile hero WebP sources |
| `seham-studio/en/index.html` | Mobile hero WebP sources |
| `seham-studio/studio.css` | Footer silk external URL; mobile hero background WebP |
| `seham-studio/studio.js` | Academy video loading strategy |
| `seham-studio/tools/phase02-optimize-images.py` | Asset generation + silk extraction (tooling) |

`MOTION_PERFORMANCE_AUDIT.md` was **not** modified.

---

## 5. New optimized assets

| Asset | Dimensions | Bytes |
|-------|------------|------:|
| `img/dscf9871-hero-640.webp` | 640×853 | 24,274 |
| `img/dscf9871-hero-960.webp` | 960×1280 | 50,856 |
| `img/dscf9871-hero-1440.webp` | 1440×1920 | 132,384 |
| `img/dscf9871-hero-1920.webp` | 1920×2560 | 292,602 |
| `img/hero-phone-480.webp` | 480×853 | 35,790 |
| `img/hero-phone-720.webp` | 720×1280 | 60,880 |
| `img/hero-phone-941.webp` | 941×1672 | 82,746 |
| `img/sl-footer-silk.webp` | (extracted from CSS) | 17,928 |

Encoding: Pillow WebP, `method=6`, photo quality **88** (no upscaling; EXIF orientation applied on course hero).

---

## 6. Original asset sizes (baseline)

Recorded at start of Phase 02 (filesystem):

| Asset | Bytes |
|-------|------:|
| `img/dscf9871-hero.jpg` | 51,907,287 |
| `img/hero-phone.png` | 1,840,452 |
| `studio.css` | 293,503 |
| `studio.js` | 42,261 |
| `assets/video/bachata-lady-style.mp4` | 2,798,704 |

Historical browser metrics (audit lab, **441×952**, cold cache): load ~19.1 s dominated by `hero-phone.png`; scroll glide 103 frames, ~16.5 ms avg, 0 long tasks — **not re-benchmarked to full Web Vitals fidelity in this pass** (see §11).

**Baseline screenshots:** Prior audit run; post-change capture: `.performance-qa/course-ar-desktop-after.png` (embedded lab viewport — narrow card layout). Full desktop before/after pairs were not stored in-repo this session.

---

## 7. Optimized asset sizes & reductions

| Item | Before (production) | After (typical) | Reduction |
|------|---------------------|-----------------|-----------|
| Course hero (LCP) | 51,907,287 B JPEG | 24–293 KB WebP by viewport | **~99.4–99.95%** |
| Mobile home hero | 1,840,452 B PNG | 36–83 KB WebP | **~95.5%** |
| Footer silk in CSS | ~380 KB base64 embedded ×4 rules | 17,928 B file + ~78 KB smaller CSS | **~286 KB less CSS** per page |
| `studio.css` | 293,503 B | 197,893 B | **32.5%** smaller |
| `studio.js` | 42,261 B | 43,422 B | +1,161 B (video logic) |

**Original masters retained:** `dscf9871-hero.jpg`, `hero-phone.png` (not deleted).

---

## 8. CSS deduplication results (M-03)

- Extracted **exact** footer silk bytes from first `data:image/webp;base64,…` occurrence.
- **4** duplicate `url('data:…')` strings → `url("img/sl-footer-silk.webp")`.
- Duplicate rule blocks **not merged** (specificity / media queries unchanged).
- `footer-signature.css` (54,039 B): **not linked** from any `seham-studio` HTML — left in place; still unused at runtime.

**Payload accounting (homepage):**

- Before: ~293.5 KB CSS (includes 4× silk base64).
- After: ~197.9 KB CSS + 17.9 KB silk (single HTTP request, browser cacheable).

**Removed duplicate inline payload (CSS only):** ~95,610 B (293,503 → 197,893 after extraction script; minor comment edit).

---

## 9. Video loading improvements (M-04)

| Behavior | Before | After |
|----------|--------|-------|
| Source attach | On in-view (≥0.28) + `preload: auto` + immediate `load()` | Source attached in `armSource()` but **`load()` only in `tryPlay()`**; `preload="metadata"` |
| Save-data / reduced motion | Still called `armSource()` on scroll | **No arm/play** until user intent (unchanged pause default) |
| Mobile coarse (≤760px + coarse pointer) | Auto-play at 0.28 | **Tap/Enter/Space** on flagship frame; in-view threshold **0.55** |
| Narrow mobile threshold | 0.28 | **0.40** |
| Off-screen | pause | unchanged |

**Intentional UX note:** On phones, the academy loop may require one tap on the card frame to start (saves ~2.8 MB until engagement). Desktop fine-pointer autoplay when sufficiently visible is preserved.

---

## 10. Before/after performance metrics

| Metric | Before (audit / filesystem) | After (this pass) |
|--------|----------------------------|-------------------|
| Course hero request | 51.9 MB JPEG | WebP verified: `currentSrc` `dscf9871-hero-640.webp` **24,274 B** in lab |
| `dscf9871-hero.jpg` in HTML | Yes | **No** references in `seham-studio` pages |
| FCP / LCP / CLS / INP | NOT MEASURED (audit avoided 49 MB fetch) | **NOT MEASURED** (no Lighthouse trace in CI) |
| DOMContentLoaded / Load | Historical mobile ~19 s (audit) | **NOT MEASURED** cold repeat |
| Scroll glide (2400px) | 103 frames, 16.5 ms avg | **NOT RE-MEASURED** post-change |
| Total transferred (course page) | Dominated by hero | **NOT MEASURED** full document |

Environment: local `python -m http.server 8773`, Cursor embedded browser (mixed viewport). **Do not** compare unaudited warm/cold mixes.

---

## 11. Responsive testing results

| Check | Result |
|-------|--------|
| AR course page loads | OK — hero uses WebP `srcset` |
| AR home / EN home | HTML updated; desktop still `home-hero-desktop.jpg` / `hero-en.jpeg` |
| Footer silk external | `img/sl-footer-silk.webp` referenced from CSS |
| Console errors on spot-check | None observed on course + home navigation |
| Viewports 320–1920 matrix | **Partial** — lab browser narrow; no device farm |
| Gift modal / drawer / checkout | **Not re-run** automated (no regressions in touched files) |

**Loader:** Course pages do not use the handwritten preloader; home loader unchanged.

---

## 12. Visual regression findings

- Course hero: crop remains `object-fit: cover; object-position: center 38%` (`course-v2.css`). WebP at quality 88 — no intentional crop change.
- Mobile hero: same composition; PNG fallback retained for non-WebP.
- Footer: same silk asset bytes as previously inlined; only delivery mechanism changed.
- Post-change lab screenshot: mobile-width course layout; verify hero photography on **≥1024px desktop** in your environment (embedded browser was narrow).

No art-direction or palette changes.

---

## 13. Remaining limitations

- **AVIF:** not generated (no `cwebp`/avifenc in PATH; Pillow WebP only).
- **1920 WebP** course candidate = **292,602 B** (under 450 KB target).
- **Heavy JPEG masters** still occupy disk/repo unless deploy excludes them (see §14).
- **Full Web Vitals + 2,400px scroll glide** should be re-run on target hardware before Phase 03.
- **Before screenshots** for all eight surfaces were not captured in-repo after optimizations began in the same session (filesystem baselines recorded).

---

## 14. Remaining technical issues (M-09) & deployment

| File | Size (bytes) | `seham-studio` runtime ref |
|------|-------------:|------------------------------|
| `assets/video/Mixxxx.mp4` | 108,569,065 | **None** |
| `img/DSCF9871(2).jpg` | 51,907,287 | **None** |
| `assets/video/home-hero-mobile.mp4` | 2,375,480 | **None** (referenced only in `seham-homepage-full/` archive) |

**Recommendation:** Exclude from production deploy / CDN sync; keep files locally for editing. `.gitignore` already lists `Mixxxx.mp4`. Recoverable **~162 MB** if omitted from publish.

---

## 15. GSAP readiness verdict

**Ready for Phase 03 — GSAP motion foundation** from a **payload / LCP** perspective, provided:

1. Deploy config does not serve `dscf9871-hero.jpg` or unused 100 MB+ videos.
2. Team re-runs scroll-glide + LCP on real desktop and mobile after deploy.
3. Motion work keeps **one scroll clock** (existing Lenis) until a deliberate migration plan.

No GSAP added in Phase 02.

---

## 16. Deviations from audit recommendations

| Audit suggestion | Phase 02 action |
|------------------|-----------------|
| Optional AVIF | Skipped — tooling not available |
| Consolidate duplicate footer CSS blocks | **Not done** — only URL deduplication to preserve cascade |
| Font subsetting | Documented as later task — no font files changed |
| CSS `backdrop-filter` review | No change — no measured regression |

---

## Acceptance criteria checklist

| Criterion | Status |
|-----------|--------|
| 49.5 MB course hero not production-delivered | **Pass** (WebP `srcset` only in HTML) |
| Mobile homepage hero optimized | **Pass** |
| Footer silk base64 removed from CSS | **Pass** |
| Academy video loading efficient | **Pass** (with mobile tap-to-play) |
| Lenis intact | **Pass** |
| Native mobile scroll | **Pass** (`syncTouch: false` unchanged) |
| Visual / business features preserved | **Pass** (scope-limited QA) |
| No GSAP / ScrollTrigger | **Pass** |

---

*Phase 02 complete. Next: Phase 03 — GSAP motion foundation on this performance baseline.*