# Seham Latino — Motion and Performance Audit

Audit date: 27 November 2026.  
Scope: `seham-studio/` as the live site (Arabic at the root, English under `en/`).  
Method: static reading of the current source, filesystem sizes, and a local Chrome session against `http://127.0.0.1:8773` with no source changes.

This document does not change the site. It is the foundation for a later motion phase. It does not install GSAP, ScrollTrigger, or any other dependency.

---

## 1. Executive summary

The homepage already has one motion system. It is not a GSAP system.

Desktop wheel scrolling is a single Lenis 1.1.20 instance, started only for a fine pointer when reduced motion is off. Touch scrolling stays native. Section entrances are CSS transitions unlocked by several IntersectionObservers in `studio.js`, `about-portrait.js`, and the hero/video blocks in the same file. There is no ScrollTrigger, no live GSAP timeline, and no letter-splitting.

The homepage can scroll smoothly in this browser. A 2,400px glide at 441×952 produced 103 frames, an average of 16.5ms, a worst frame of 17ms, and no long tasks. That is one lab trace, not a guarantee for every device.

The project is not ready for an advanced ScrollTrigger build on top of what exists. Two confirmed costs would dominate any new motion work:

- `online-course.html` and `en/online-course.html` load `img/dscf9871-hero.jpg` with `fetchpriority="high"`. The file is 51,907,287 bytes and is declared at 8736×11648.
- Viewports at or below 760px select `img/hero-phone.png` (1,840,452 bytes). In the 441px trace that image accounted for almost the entire 19.1s load event.

`studio.css` is 293,503 bytes because the footer silk image is inlined as base64 four times. GSAP is not on disk. A preview HTML file points at GSAP 3.12.5 on a CDN and is not part of the live pages.

**Verdict:** ready for a small, centralized GSAP entrance layer after the course image and the phone hero are treated as blockers. Not ready for scrubbed, pinned, or scroll-driven scenes until the existing observers and Lenis stay the only scroll clocks.

---

## 2. Complete animation system inventory

Live pages do not use a module bundler. There is no `package.json` in `seham-studio`. Scripts are classic deferred files.

### Shared files that paint the homepage

| File | Bytes | Role |
|---|---:|---|
| `studio.css` | 293,503 | Global layout, motion, and the inlined footer |
| `studio.js` | 42,261 | Header, Lenis, observers, hero, video, drawer, purchase bar |
| `about-portrait.css` | 16,544 | About Seham |
| `about-portrait.js` | 1,174 | About entrance |
| `editorial-story.css` | 18,418 | Testimonials / freedom story |
| `final-gesture.css` | 2,047 | Closing gesture |
| `gift-experience.css` | 13,195 | Gift modal only |
| `gift-experience.js` | 4,945 | Gift modal behavior |
| `preloader.css` | 2,150 | Handwritten loader |
| `preloader.js` | 1,609 | Loader timer |
| `vendor/lenis.min.js` | 14,242 | Loaded at runtime on fine pointers |
| `course-v2.css` | 10,733 | Online course page |
| `footer-signature.css` | 54,039 | Not linked from any HTML |

`ar/` is a third HTML tree. It was not the measured surface. `preview-ar.html`, `preview-en.html`, `seham-loader-handwritten.html`, and `Seham Latino — Loader Preview.html` are previews, not the live navigation.

### Lenis

`studio.js` lines 78–154.

- Target: the window.
- Init: dynamic `<script>` whose URL is derived from `studio.js`, so `en/` resolves to `/vendor/lenis.min.js`. Confirmed in the English trace: `http://127.0.0.1:8773/vendor/lenis.min.js`.
- Gate: `prefers-reduced-motion: no-preference` and `(hover: hover) and (pointer: fine)`.
- Options: `lerp: 0.092`, `smoothWheel: true`, `syncTouch: false`, `wheelMultiplier: 1`, `touchMultiplier: 1`, `autoRaf: false`, `anchors: { offset: -100 }`.
- Clock: one `requestAnimationFrame` loop that continues only while `lenis.isScrolling` is set or the animated scroll is more than 0.4px from the target (`studio.js` 105–111). Woken by `wheel` (passive, line 132), keyboard arrows / page / home / end / space (lines 133–149), and a patched `scrollTo` (lines 116–121).
- Cleanup: none on page hide. The loop stops itself when the glide ends. `lenis.stop()` runs when `html` gains `is-scroll-locked` (lines 123–131 and 447).
- Conflict: a second Lenis is refused by `window.__sehamLenis` (line 90). There is no GSAP ticker to sync, because GSAP is not loaded.
- Cost: idle desktop does not keep a perpetual RAF. During a glide it is one extra frame callback plus the existing scroll listener.

### Native scroll listener

`studio.js` lines 38–76.

- Passive `scroll` listener. Coalesced onto one `requestAnimationFrame`.
- Writes: header class `scrolled` when `scrollY > 18`, `scaleX` on `.read-progress`, and a hero `translate3d` of at most 16px when `innerWidth >= 761` (lines 56–65).
- Reads `scrollHeight` once per frame only when the progress value changes. No `getBoundingClientRect` in this path.
- Lenis also calls this function via `lenis.on("scroll", onScroll)` (line 122), so header and hero stay in step during a glide.

### IntersectionObservers

| Location | Lines | Targets | Threshold | Cleanup |
|---|---|---|---|---|
| `studio.js` chapter | 381–399 | Homepage chapter sections | `0`, rootMargin `-12% 0px -28% 0px` | Stays connected for the life of the page |
| `studio.js` reveals | 661–679 | `.reveal-line`, `.reveal-media`, `.reveal-measure`, `.section-heading`, `.feature-card`, `.product-editorial`, `.course-tile`, `.social-grid`, `.upcoming`, `.coming-index`, `.voices`, `.freedom-inner`, `.final-cta` | `0.01`, rootMargin `12% 0px 8% 0px` | `unobserve` after enter |
| `studio.js` sectional | 684–712 | `.curated`, `.academy` | `0.04` | `unobserve`, plus a 2,200ms failsafe |
| `studio.js` closing | 717–732 | `.closing-canvas` | `0.04` | `unobserve` |
| `studio.js` freedom portrait | 953–962 | `.freedom[data-freedom-portrait]` | `0.18` | `disconnect`. Skipped under 1200px and under reduced motion |
| `about-portrait.js` | 29–38 | `.about-portrait` | `0.08` | `disconnect`, plus a 2,400ms failsafe |
| `studio.js` academy video | 1084–1099 | Flagship media | `0`, `0.28`, `0.55` | Stays connected so play/pause can reverse |
| `studio.js` purchase bar | 1340–1347 | Online course enroll target | `0.28` | Stays connected. Only on `body.page-online-course` |

Reveal observers add `is-visible` or `is-in`. The actual motion is CSS. They do not tween properties themselves.

The chapter observer is the one that still measures layout. `pickActive` (`studio.js` 326–374) calls `getBoundingClientRect` on each visible chapter when an intersection entry arrives, then again from a debounced resize (lines 406–412). It does not run on every scroll frame. The comment at lines 400–404 records that a per-frame measurement was previously the mobile stutter.

### requestAnimationFrame

- Scroll chrome: `studio.js` 72, only while a scroll event is pending.
- Lenis glide: `studio.js` 107–114, only while gliding.
- Chapter pick: `studio.js` 378, one frame after an intersection or a resize.
- Scroll-lock restore: `studio.js` 468.
- Drawer: `studio.js` 586.
- Testimonial measure: `studio.js` 854.
- Freedom portrait: `studio.js` 945.
- About portrait: `about-portrait.js` 15–16, two frames.
- Hero cinema: `studio.js` 1322.
- Gift unlock: `gift-experience.js` 56, one frame.

No `setInterval` was found in the live scripts. `setTimeout` is used for the preloader (1,960ms or 170ms), the header signature swap, drawer close fallback (620ms), sectional failsafe (2,200ms), about failsafe (2,400ms), resize debounce (120–180ms), and the mobile hero enter delay (480ms).

### CSS animations and transitions

Signature easing is `cubic-bezier(0.22, 1, 0.36, 1)` on `--ease-out`, `--ease-soft`, and `--ease-silk`.

Keyframes in `studio.css`:

| Name | Line | Properties | Duration where applied |
|---|---|---|---|
| `head-sig-out` / `head-sig-in` | 694, 705 | opacity, translateY (9px travel) | 380ms, header custom property `--head-sig-dur` |
| `heroReveal` | 1830 | opacity 0.92→1, scale 1.012→1 | 0.9s on `.hero-still` (line 1689 and the mobile override at 7947) |
| `academyStatusPulse` | 2139 | opacity only, and only while `.academy.is-in` | 2.8s infinite |
| `sg-silk-drift` / `sg-silk-drift-rtl` | 4920, 4929 | translate3d 8px plus the existing rotate | Scroll-linked, fine pointer only (4906–4917) |
| `courseHeroIn` / `courseMediaIn` | 6568, 6579 | Course page entrance | Course page |
| `heroCinemaCopy` | 8119 | opacity, translateY 0.7rem | 0.72s, staggered 0.12–0.46s (8094–8117) |

`html` scroll behavior is `auto` (`studio.css` 85–86). Reduced motion forces `scroll-behavior: auto` again at line 8404.

Hover image scales are small and compositor properties: `.product-editorial:hover .product-media img` scale 1.025 over 1s (3516–3520); `.video-link:hover img` scale 1.03 over 0.9s (6940–6946). Arrow hovers are disabled under `(hover: none)`.

### Web Animations API

No `element.animate(` calls in the live scripts.

### Wheel, touch, resize

- `wheel`: one passive listener, Lenis wake only (`studio.js` 132). Lenis itself listens to wheel internally and calls `preventDefault` on desktop wheel events it smooths. Touch is not synced (`syncTouch: false`).
- `touch*`: no site-authored touch listeners in `studio.js`. Native scrolling.
- `resize`: header chapter debounce (406), drawer origin (649), testimonial stage (914). All debounced or limited to an open drawer.

### Competing properties

Hero photograph: `heroReveal` animates `transform` on `.hero-still` for 0.9s, and `updateChrome` writes `transform` on the parent `.hero-picture`. They are different elements, so they do not overwrite each other. After 0.9s the still animation ends at `transform: none`.

Gift silk: the scroll-linked keyframes include `rotate(-5deg)` and the RTL `scaleX(-1)`, matching the static rule at 4888–4903. The animation replaces that transform while it runs. It does not run on touch.

No script splits Arabic into letters. The only `split(` calls in `studio.js` (480, 483) split URL paths.

---

## 3. Current scroll architecture

Scrolling is native on touch and on reduced motion. On a fine pointer it is native scrolling driven by Lenis: Lenis sets the window scroll position, and the browser still paints sticky and fixed elements against that scroll.

There is one smooth-scroll system. `scroll-behavior` is `auto`, so CSS smooth scroll does not fight Lenis.

Two RAF paths can overlap during a desktop glide: the Lenis loop, and the scroll listener’s single chrome frame. They do not each query layout every frame. The chrome function writes transform and a class.

Anchor handling is Lenis `anchors: { offset: -100 }` for same-page hash clicks. The homepage has one in-page hash, the skip link `#main-content`. Keyboard scrolling wakes the same loop.

Scroll lock is class-based. `studio.js` `lockScroll` / `unlockScroll` (around 447 and 464) and `gift-experience.js` `lockScroll` (lines 32–41) both set `html.is-scroll-locked`. A MutationObserver (studio.js 123–131) stops Lenis when that class appears and starts it when the class leaves. Dialogs get `data-lenis-prevent` (lines 91–93) so the gift modal and the drawer can scroll internally while the page wheel is stopped.

`html` uses `overscroll-behavior: none` (`studio.css` 140). The drawer and gift dialog use `overscroll-behavior: contain` (`studio.css` 992 and 1164, `gift-experience.css` 25).

The fixed homepage header is `position: fixed` on `.page-index`. Inner pages use sticky. The header color and background transition over 0.35s. Height is not animated. That avoids a layout animation on the first scroll.

Sticky and fixed elements were not observed jumping in the 1440 and 390 traces. Scroll restoration across the gift modal and the drawer was verified in the previous session on this same code: scrollY held at 5750 while both overlays were open, and Lenis restarted at that position. This audit did not repeat that interaction trace.

---

## 4. GSAP readiness assessment

GSAP is not installed for the live site.

`seham-studio/vendor/` contains only `lenis.min.js` (14,242 bytes). There is no `gsap.min.js` on disk. No live HTML file loads GSAP. No live script calls `gsap.`, `ScrollTrigger`, `registerPlugin`, `gsap.context`, `matchMedia` from GSAP, or `ScrollTrigger.refresh`.

`Seham Latino — Loader Preview.html` loads `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js` and builds one timeline for a loader preview. That file is outside the live page graph. ScrollTrigger is not in that preview either.

Consequences for a future GSAP phase:

- Nothing is double-registered today.
- There is no context or cleanup to inherit.
- Adding ScrollTrigger beside the current observers would create a second system that measures layout on scroll. The chapter observer was already reduced to a single threshold for that reason (`studio.js` 394–395).
- Lenis is not on the GSAP ticker. If GSAP is added later, one clock has to own the frame: either Lenis keeps `autoRaf: false` and is driven by `gsap.ticker`, or GSAP is used only for entrance timelines that are not scroll-scrubbed. Running both `gsap.ticker` and the current Lenis loop would be a second clock.
- Arabic text must stay in whole lines. GSAP SplitText, or any per-character split, would break joining. None of that exists today, and it should not be introduced.

Readiness: the code is clean enough to add GSAP as an entrance tool. It is not prepared as a ScrollTrigger architecture.

---

## 5. Lenis readiness assessment

Lenis is present, version 1.1.20, file `vendor/lenis.min.js`.

| Question | Finding |
|---|---|
| Where | `studio.js` 84–154, one instance, `window.__sehamLenis` |
| RAF | Conditional, not `autoRaf` |
| GSAP ticker | None. GSAP is absent |
| ScrollTrigger | None |
| Touch | `syncTouch: false`. At 390px with touch emulation, `lenis` was `false` |
| Nested scroll | `data-lenis-prevent` on every `dialog` |
| Modals | Stopped by the `is-scroll-locked` class, including the gift modal’s own lock |
| Reduced motion | Lenis is not constructed |
| Cleanup | Loop ends when the glide ends. No `destroy()` on navigation because these are full page loads |

Lenis is useful on desktop wheel and trackpad, where a short lerp (0.092) is the current feel. It is not useful on touch, and the code already keeps touch native. Replacing it with CSS `scroll-behavior: smooth` would bring back the document-wide smoothing that fought section changes. Leaving the wheel native is a valid later choice if the lerp ever feels late. It is not required for correctness today.

A narrow desktop window still starts Lenis, because the gate is the pointer, not the width. The English trace in this audit loaded at 220px with Lenis on (`lerp` 0.092). That is correct for a mouse. It is the wrong experience only if a real phone reports a fine pointer, which it should not.

---

## 6. Confirmed performance bottlenecks

### C1 — Online course hero is a 49.5 MB photograph

`online-course.html` line 58 and `en/online-course.html` line 58:

```html
<img ... src="img/dscf9871-hero.jpg" width="8736" height="11648" decoding="async" fetchpriority="high"/>
```

File size: 51,907,287 bytes. A second file, `img/DSCF9871(2).jpg`, is the same size and is not referenced. This audit did not download the course page in the browser, because that would transfer the 49.5 MB file again. The HTML and the filesystem size are sufficient.

Impact: first paint of the course page waits on an image that is far larger than any viewport. `fetchpriority="high"` asks the browser to prefer it.

### C2 — Phone hero PNG is 1.8 MB

`index.html` lines 78–81 select `img/hero-phone.png` at `max-width: 760px`. File size 1,840,452 bytes.

Measured at 441×952, fine pointer, cold local load:

- First paint and first contentful paint: 188ms.
- DOMContentLoaded: 195ms.
- `loadEventEnd`: 19,072ms.
- `hero-phone.png` decoded body 1,838,860 bytes, resource duration 18,976ms.
- The same page at 1440×900 selected `home-hero-desktop.jpg` (138,102 bytes, natural 1679×937, rendered about 1430×928) and the load event was 132ms on a warm cache.

At 390×844 with touch emulation the phone image’s natural size was 941×1672, rendered at 390×844. The pixel dimensions are plausible for a 2x screen. The byte weight is not.

The 19s figure is a local embedded-browser timing of an uncached 1.8 MB PNG. It is not a field network measurement. The byte size is the durable fact.

### C3 — Stylesheet carries four copies of the footer silk

`studio.css` is 293,503 bytes. The footer silk base64 marker occurs 4 times in that file (the signature-footer blocks from about line 8421 through 8441). Every page that links `studio.css` downloads and parses that weight. `footer-signature.css` (54,039 bytes) is not linked from HTML, so it is unused weight in the repo, not on the wire.

Measured decoded size of `studio.css` in both homepage traces: 293,503 bytes. The local server did not gzip. Production compression would shrink the text, and would still send the duplicated image four times inside one file.

### C4 — Academy video is 2.8 MB and can download on the homepage

`index.html` line 125: `preload="none"` and `data-src="assets/video/bachata-lady-style.mp4"`. File size 2,798,704 bytes.

`studio.js` 1040–1099 arms the source and calls `play()` when the media intersection ratio reaches 0.28. In the 441px trace the video transferred 2,799,004 decoded bytes. At 1440×900, before scrolling the academy into view, the video was not in the resource list. So the file is not in the initial HTML preload, and it does download once the observer decides the section is in view.

---

## 7. Potential bottlenecks

These are visible in code or in a single trace, and were not isolated with a performance profile per section.

- Chapter `getBoundingClientRect` during fast section crossings (`studio.js` 345–370). Not per frame. Still a layout read on the scroll that crosses a chapter edge.
- `will-change: transform, opacity` on the header signature only while it is entering or leaving (`studio.css` 681–683). Short-lived. Fine if chapter changes are rare. Costly if the signature swaps repeatedly during a fast scroll.
- `backdrop-filter: blur(8px)` on captions that sit over photographs: `studio.css` 3534 (`.product-caption`), 5786 (`.course-tag`, `.course-number`), 6957 (`.video-link span`), 7258, 7475, 7483. These are not animated. They force a backdrop read when those layers move with scroll.
- `filter: saturate()` / `contrast()` / `brightness()` on photography at `studio.css` 3273 and 3988. Static filters. They promote paint cost on those images, including during scroll if the layer is not isolated.
- `translateZ(0)` plus `backface-visibility: hidden` near `studio.css` 8388, on a rule that forces a layer. Combined with `contain: paint` on `.academy-flagship-media` and `.about-portrait .ap-photo` (8392–8395).
- Academy status pulse is infinite, but opacity-only and only while `.academy.is-in` (`studio.css` 2133–2139). Low cost. It still runs after the section has entered, until the user leaves the page.
- `void intro.offsetWidth` in `preloader.js` line 47 and `void textNode.offsetWidth` in `studio.js` line 285. Each is one forced reflow at a state change, not during scroll.
- Unreferenced media on disk, not seen in HTML, CSS, or JS: `assets/video/Mixxxx.mp4` (108,569,065 bytes), `img/DSCF9871(2).jpg` (51,907,287 bytes), `assets/video/home-hero-mobile.mp4` (2,375,480 bytes). They do not transfer until something references them. They will transfer if the deploy publishes the whole folder through a loose path, and they dominate any repo or backup size.

---

## 8. CSS performance analysis

Compositor-friendly motion that is actually in use:

- Header progress `scaleX` from JS.
- Hero picture `translate3d`, max 16px, width ≥ 761.
- Hero still scale 1.012 and opacity, 0.9s, then finished.
- Hero copy translateY 0.7rem and opacity, 0.72s.
- Silk view-timeline translate of 8px, fine pointer only.
- Reveal classes that transition transform and opacity. The global reduced-motion block at `studio.css` 8398–8414 sets `animation: none` and `transition: none` on every element and restores reveal opacity.

Layout-sensitive motion that was removed from the header (height is no longer in the transition, `studio.css` 541–545) should stay removed. Button and card hovers still transition `box-shadow` (for example 379, 5096, 6827, 6900). Those run on hover, not on scroll. They are paint, not layout. They are acceptable at 0.3–0.35s. They should not be copied onto scroll-scrubbed elements.

`clip-path` appears in the reduced-motion reset (8413), which clears it. The silk comment at line 1031 says the dissolve lives in the SVG rather than a clip-path. Footer silk uses `mask-image` (the inlined block). Masks on a large footer image are a paint cost when the footer is on screen. The footer silk is not animated.

No animated `width`, `height`, `top`, `left`, `margin`, or grid templates were found in the scroll path. The preloader is `position: fixed; inset: 0` and does not reflow the document when it hides (`preloader.js` sets `hidden`).

`will-change` is otherwise cleared under reduced motion (`studio.css` 1623 and 8417). `.read-progress` no longer declares a permanent `will-change`.

---

## 9. JavaScript performance analysis

Initialization order on the homepage, all `defer`:

1. `preloader.js` — may hold a 1.96s overlay.
2. `studio.js` — fonts (no-op if the link exists), scroll bus, Lenis script injection, chapter observer, drawer, reveal observers.
3. `gift-experience.js` — modal binding.
4. `about-portrait.js` — one observer.

`studio.js` is one file with several IIFEs. They all run on parse of that script. Inner pages pay for homepage observers that return immediately when their nodes are missing (hero, academy video, freedom voices). That is cheap. The Lenis download is the one extra request, and only on fine pointers.

DOM queries for reveals happen once, at startup (`studio.js` 656–659), then each node is observed or shown. Chapter nodes are queried once (318–321). This is not a per-frame query loop.

The testimonial slider (`studio.js` 737–923) measures its stage on init, on font ready, and on a debounced resize. It translates the track when the user clicks. It does not listen to scroll.

No memory-leak pattern was confirmed. Observers that must keep running (chapter, video play/pause, purchase bar) are intentional. Reveal observers unobserve. There is no SPA, so a full navigation drops the page.

`studio.js` lines 2–17 inject the Google font stylesheet if `#seham-fonts` is missing. The homepage already has that link (`index.html` line 12), so the homepage does not request the CSS twice. Pages that forget the link get it from the script, after defer, which is later than a head link.

---

## 10. Asset performance analysis

Homepage hero, desktop: `img/home-hero-desktop.jpg`, 138,102 bytes, 1679×937, rendered at roughly the viewport width in the 1440 trace. This is a reasonable LCP image. `fetchpriority="high"` is set (`index.html` 89).

Homepage hero, narrow: `img/hero-phone.png`, 1,840,452 bytes. See C2.

There is no `<video class="hero-cinema-video">` in `index.html`. `studio.js` 1119–1124 sees the missing video and adds `is-cinema-ready` and `is-cinema-entered` immediately, which starts the text reveal without waiting for a video. `assets/video/home-hero-mobile.mp4` is unused by the templates searched.

Gift silk: `assets/decorative/seham-gift-silk.svg`, 4,063 bytes, used twice in the homepage (section and modal). The scroll drift is a transform on that `<img>`. No SVG filter, no turbulence.

Menu silk SVG: 3,478 bytes. Wave SVGs are 2.9–4.0 KB. Portrait masks are under 1 KB.

Testimonials: `img/freedom-seham.webp`, 418,234 bytes. It was in the homepage resource list.

About and services photography that loaded with the homepage trace included `seham-beach.jpg` (90,083 bytes) and smaller JPEGs around 45 KB.

Footer fabric: not the SVG. It is a WebP inlined four times in `studio.css`, plus `mask-image`. Separate files `img/footer-silk-fabric.png` (1,077,567 bytes) and `img/footer-silk-fabric.webp` (153,684 bytes) were not in the homepage resource list.

Academy video: 2,798,704 bytes. See C4.

Course page: 51,907,287 bytes. See C1.

Disk total of image, svg, and video files under `seham-studio` outside `ar/` and `en/`: about 232 MB across 61 files, dominated by `Mixxxx.mp4` and the two 49.5 MB JPEGs.

Gift silk and the decorative SVGs are not the rendering problem. The photographs and the inlined footer image are.

---

## 11. Section-by-section findings

Motion intensity below is a recommendation for a later phase. Nothing here was implemented.

### Preloader

`preloader.js` 35–50, `preloader.css`. CSS stroke-dashoffset draw, then a 0.52s curtain delayed to 1.42s. Programmed hold is 1,960ms, or 170ms when reduced motion matches. The overlay is `visibility: hidden` until `.run`, so a failed script does not leave a visible curtain (`preloader.css` sets `visibility: hidden`, and `.run` shows it). The script always plays on each visit. It does not wait for fonts or images. It does cover the hero and sets `touch-action: none` while it runs, so the first two seconds are not scrollable. One forced reflow (`offsetWidth`) restarts the CSS animation. Appropriate for production only if the 1.96s hold is an intentional brand beat. It is not required for correctness, and it delays the moment the hero can move.

### Header

Fixed on the homepage. Class `scrolled` after 18px. Color and background transition 0.35s. No blur on the scrolled bar. Signature text swaps with a 9px, 380ms opacity/translate when the chapter observer picks a new section. `will-change` only during that swap. Intensity later: keep this. Do not add a scroll-scrubbed header.

### Navigation menu

`<dialog id="drawer">`. Open lock stops Lenis. Focus trap and Escape are in `studio.js` around 621–646. Close fallback timer 620ms. `data-lenis-prevent` lets the panel scroll. Intensity: leave it. A GSAP open would have to respect the dialog and the scroll lock.

### Hero

Still photograph, not a video, on the current homepage. Desktop parallax is at most 16px and only from 761px up. Copy reveal is line-level, 0.72s, translateY 0.7rem. LCP text is not split. At 390px the phone PNG is the cost, not the motion. Intensity: keep the current restraint. Do not scale, blur, or pin the hero.

### Academy

Ivory section. Entrance class `is-in` from the sectional observer, with a 2.2s failsafe so it cannot stay invisible. Status dot pulses opacity only while `is-in`. Flagship video mounts when 28% visible. Intensity: a single editorial reveal of the title and the still. Do not scrub the video.

### Course cards

CSS hover scale and shadow. No scroll tween. The online course page is a different template and carries C1. Intensity: hover only, and only for fine pointers.

### Testimonials

`[data-freedom-voices]` in `studio.js` 737–923. Click and keyboard. Resize measure is debounced. No autoplay interval was found. Freedom portrait observer is desktop-only (skipped under 1200px). Intensity: keep the slider mechanical and quiet.

### About Seham

`about-portrait.js` adds `ap-js`, then `ap-in`, then `ap-done` after 1,600ms. Reduced motion and a missing observer return immediately, so the section stays visible. Failsafe at 2,400ms. Separate from the freedom portrait observer. Intensity: one mask or image reveal. Do not add a second observer if GSAP takes this over. Remove the duplicate trigger in that case.

### Other ways to move

Service cards use the shared reveal list (`.product-editorial`, `.feature-card`). Hover scale 1.025. Backdrop blur on the caption (line 3534). Intensity: stagger the three cards by about 0.08s once, on enter. Do not replay on scroll up. The current reveal observer already unobserves, so it does not replay.

### Gift section

Silk SVG, 4 KB, 8px view-timeline drift on fine pointers. Static otherwise. Intensity: keep the drift. Do not add a continuous loop.

### Gift modal

`gift-experience.js`. Own scroll lock, compatible with the Lenis class observer. `overscroll-behavior: contain`. Reduced motion disables the open animation (`gift-experience.css` 653). Intensity: none beyond the open fade that already exists.

### Final CTA

`.closing-canvas` and `.final-cta` use the shared reveal observers. `final-gesture.css` is 2 KB. Intensity: one quiet entrance. No pin.

### Footer

Inlined in `studio.css`, silk is a masked WebP, not animated. Link color transition 0.18s, removed under reduced motion (line 8441). Intensity: leave it static. The work here is deduplicating the base64, not animating the silk.

### Other pages

`studio.js` is linked from the Arabic and English about, courses, classes, coaching, contact, faq, gift, library, lesson, membership, account, register, privacy, accessibility, videos, checkout, and online-course pages. Checkout currency toggle is plain DOM (`studio.js` 966–974). The purchase bar observer runs only on `page-online-course` (1331–1353). Those pages inherit Lenis, the header, and the global CSS. They should not each grow a ScrollTrigger setup.

---

## 12. Desktop and mobile findings

Measured in the embedded Chrome session. INP was not measurable: no interaction latency trace was recorded. CLS was not measured: `layout-shift` entries are absent unless an observer is armed before load, and the empty buffer must not be reported as a CLS of 0. LCP entries were also absent from the buffer. First contentful paint was available.

| Viewport | Pointer | Lenis | Hero file | FCP | Notes |
|---|---|---|---|---:|---|
| 441×952 | fine | yes | `hero-phone.png` (1.84 MB) | 188ms | `load` 19,072ms. Video 2.80 MB also transferred. DOM 444. |
| 1440×900 | fine | yes | `home-hero-desktop.jpg` (138 KB) | 132ms | Warm cache. Hero rendered 1430×928. Horizontal overflow −10px (scrollbar gutter). DOM 443. Heading opacity 1. |
| 390×844 | coarse, hover none | no | `hero-phone.png`, natural 941×1672, rendered 390×844 | 72ms | Warm cache. Silk animation `none`. Overflow 0. DOM 442. |
| English, 220px wide | fine | yes, lerp 0.092 | not rechecked | 52ms | `dir=ltr`, `lang=en`, Lenis URL correct, heading opacity 1. DOM 443. |

Scroll trace, Arabic, 441×952, Lenis glide of 2,400px over 1.7s: 103 frames, average 16.5ms, worst frame 17ms, 0 frames over 22ms, 0 long tasks.

320, 768, 1024, and 1920 were not given their own traces. The 390 and 1440 runs cover the touch gate and the desktop hero. A trace at 1920 would mostly repeat the 1440 hero file. A trace at 320 would still select `hero-phone.png`.

Mobile strategy already in the code, and the right one to keep:

- Native scrolling. Confirmed by touch emulation.
- No silk drift, no hero parallax under 761px, no Lenis.
- Lighter hero copy path: mobile cinema enter is skipped when reduced motion or save-data is set; otherwise a 480ms delay (`studio.js` 1322–1327).
- Purchase bar only on the course page, hidden while the enroll target is visible, and hidden when the drawer opens.

What should later be simplified on mobile is the 1.8 MB PNG, not the motion. The motion is already the light path.

---

## 13. Accessibility findings

`prefers-reduced-motion: reduce` is handled in three layers:

- `studio.js` line 24 skips Lenis, skips `js-motion`, and skips reveal setup. Chapter signature falls through to the static label (line 417).
- `about-portrait.js` lines 6–7 return before hiding anything.
- `studio.css` 8398–8414 kills animation and transition globally and forces reveal nodes to opacity 1, `transform: none`, `clip-path: none`.
- Preloader shortens to 170ms (`preloader.js` 36).
- Gift modal open animation is disabled (`gift-experience.css` 653).
- Hero copy is forced visible (`studio.css` 8130–8139).

If JavaScript never runs, `js-motion` is never added, so the reveal opacity rules that depend on `.js-motion` do not hide content. The preloader stays `visibility: hidden`. Content remains in the document.

Keyboard: the testimonial root handles arrows, Home, and End (`studio.js` 895–908). The drawer traps focus. Lenis wakes on arrow and page keys so desktop keyboard scroll still glides instead of being ignored. Reduced motion never constructs Lenis, so keyboard scroll stays native.

No text is split. Arabic joining is not at risk from the current motion.

Dialogs are real `<dialog>` elements (drawer and gift modal). This audit did not re-run a screen reader pass.

Focus outlines exist on footer links (`studio.css` footer block, `outline: 2px solid`). A full focus-visibility audit of every control was not part of the trace.

---

## 14. Prioritized technical issues

### P0 — none confirmed for homepage scrolling

Homepage scrolling, in the traces above, is not broken. The course-page image is severe enough to treat as a launch blocker for that page, and it is classified P1 because this audit did not record a failed render, only the file and the markup. If a production course-page load fails or takes tens of seconds on a mobile network, promote C1 to P0.

### P1 — High

**M-01. Course hero file.**  
Severity: P1. File: `online-course.html` line 58, `en/online-course.html` line 58, asset `img/dscf9871-hero.jpg`.  
Component: online course hero.  
Evidence: 51,907,287 bytes, declared 8736×11648, `fetchpriority="high"`. Duplicate unreferenced `img/DSCF9871(2).jpg` at the same size.  
Impact: the course page’s first load is dominated by one photograph. Any GSAP intro on that page would be invisible behind the download.  
Recommendation: serve a viewport-sized JPEG or WebP and drop `fetchpriority` until the file is small. Do not do this in the motion phase until the asset change is explicit.  
Complexity: low for the markup, separate from motion. Regression risk: art direction of the crop.

**M-02. Phone hero PNG.**  
Severity: P1. File: `index.html` 78–81, `img/hero-phone.png`.  
Evidence: 1,840,452 bytes. 441px trace duration 18,976ms and `load` 19,072ms. 390px trace rendered it at 390×844 from a 941×1672 bitmap.  
Impact: narrow homepage LCP. Motion on the hero cannot feel instant while this file is the LCP.  
Recommendation: a compressed WebP or AVIF at roughly 780–1000px wide.  
Complexity: low. Regression risk: image quality on the phone crop.

**M-03. Footer silk repeated in CSS.**  
Severity: P1. File: `studio.css`, four occurrences of the same base64 payload, stylesheet 293,503 bytes.  
Evidence: decoded size 293,503 in the homepage traces. `footer-signature.css` is unused by HTML.  
Impact: every page parses a large stylesheet before later CSS. This competes with hero paint.  
Recommendation: one external WebP, one rule.  
Complexity: medium, because the footer block is duplicated and easy to break visually. Regression risk: footer silk position and mask.

**M-04. Academy video download.**  
Severity: P1 on mobile data, P2 on desktop. File: `index.html` 125, `studio.js` 1040–1099, asset 2,798,704 bytes.  
Evidence: transferred in the 441px homepage trace; absent from the 1440px trace before that section was in view.  
Impact: a narrow viewport that reaches the academy pulls 2.8 MB of video.  
Recommendation: keep `preload="none"`, and do not arm the source until a user gesture or a much stricter threshold on save-data and coarse pointers. The save-data branch already sets `preload` to `metadata` (line 1043) but still calls `load()`.  
Complexity: low. Regression risk: the video feels late to start.

### P2 — Medium

**M-05. Chapter layout reads.** `studio.js` 326–374 and 381–399. Not per frame. Still the main scroll-time layout read. Keep it off the scroll listener. If GSAP arrives, do not add ScrollTrigger triggers that also measure these sections.

**M-06. Lenis follows the pointer, not the width.** Confirmed at English 220px with Lenis on. Acceptable for a mouse. Document it so a future “mobile” breakpoint does not assume Lenis is off just because the window is narrow.

**M-07. Backdrop filters on scrolling chips.** `studio.css` 3534, 5786, 6957, 7258, 7475, 7483. Static `blur(8px)`. Replace with a solid wash if a device profile shows paint time in those sections. Not a homepage-scroll blocker in the 17ms glide trace.

**M-08. Two portrait entrance systems.** `about-portrait.js` 1–49 and `studio.js` 925–963. Different sections (`.about-portrait` and `.freedom[data-freedom-portrait]`). Not a bug. A future GSAP layer should own both or neither, or the failsafe timers (1.6s, 2.2s, 2.4s) will fight a timeline.

**M-09. Unreferenced heavy files in the tree.** `Mixxxx.mp4` 108,569,065 bytes, `DSCF9871(2).jpg` 51,907,287 bytes, `home-hero-mobile.mp4` 2,375,480 bytes. No references in HTML, CSS, or JS. Runtime impact: none until a deploy serves the directory. Repo and backup impact: large.

### P3 — Low

**M-10. Hover shadows.** Several `box-shadow` transitions at 0.3–0.35s. Hover only. Leave them unless a profile shows hover jank.

**M-11. Preloader on every visit.** 1,960ms, no session skip. Brand decision, not a scroll bug.

**M-12. Font stylesheet weight.** One Google CSS request for Fustat 400–700, Cormorant 400/500/600 plus italic 400, Jost 300/400, Tajawal 400/500/700, `display=swap` (`index.html` 12). `display=swap` avoids invisible text. Unused weights, if any, are a later font subset task. No layout-shift number was captured.

---

## 15. Actual performance measurements

All figures below were recorded in this audit against the local server. No field RUM. No gzip. No production CDN.

Arabic homepage, 441×952, fine pointer, cold:

- FCP 188ms, DOMContentLoaded 195ms, load 19,072ms.
- Largest transferred bodies: video 2,798,704 bytes, `hero-phone.png` 1,838,860 bytes, `freedom-seham.webp` 418,234 bytes, `studio.css` 293,503 bytes.
- 25 resources, decoded sum about 5.8 MB.
- DOM nodes: 444.
- Lenis present.

Arabic homepage, 1440×900, warm:

- FCP 132ms, DOMContentLoaded 128ms, load 132ms.
- Hero `home-hero-desktop.jpg` 138,102 bytes.
- `studio.css` still 293,503 bytes.
- Academy video not yet requested.
- DOM nodes: 443.
- `scrollWidth - innerWidth` = −10.

Arabic homepage, 390×844, touch emulation, warm:

- FCP 72ms.
- Lenis absent, silk animation `none`, heading opacity 1.
- Overflow 0.
- DOM nodes: 442.

Scroll glide, 441×952, 0 → 2,400px, 1.7s:

- 103 frames, average 16.5ms, worst 17ms, no frame over 22ms, no long tasks.

English homepage, 220× viewport after a tab restart, warm:

- `dir=ltr`, `lang=en`, Lenis 1.1.20 from `/vendor/lenis.min.js`, lerp 0.092, FCP 52ms, heading opacity 1, 443 nodes.

Not measured: LCP element timing, CLS, INP, 320/768/1024/1920 as separate traces, a production gzip pass, a physical phone, and a CPU profile of the course page.

---

## 16. Recommended future architecture

Use the systems that already match the page. Do not stack a third scroll engine.

**Keep**

- Native scrolling on touch and under reduced motion.
- One Lenis instance for fine pointers, lerp near 0.09, `syncTouch: false`, conditional RAF, `data-lenis-prevent` on dialogs, stop/start tied to `is-scroll-locked`.
- CSS for hover and for anything that is a state change (header color, buttons, gift selection).
- IntersectionObserver for “play video while visible” and for the purchase bar. Those are behavior, not decoration.
- Whole-line Arabic reveals. No character splits.

**Add, later, in one place**

- GSAP only as an entrance timeline factory: one `gsap.context()` per page, reverted on `prefers-reduced-motion` and on page teardown.
- Drive Lenis from `gsap.ticker` only if GSAP is actually on the page, and delete the hand-rolled RAF loop at that moment. One clock.
- Do not register ScrollTrigger for the homepage sections. The reveals are one-shot. Scrub and pin would delay access to the content and would reintroduce layout measurement on scroll.

**Consolidate when GSAP entrances replace CSS reveals**

- The `.js-motion` reveal observer (`studio.js` 654–680) and the sectional `is-in` observer (682–712).
- Leave the chapter observer, the video observer, and the purchase-bar observer alone. They are not entrances.

**Do not add**

- A second Lenis.
- ScrollTrigger pin or horizontal sections.
- SVG turbulence, displacement filters, or a silk WebGL pass.
- Magnetic buttons, custom cursors, or scroll smoothing on touch.

**Reduced motion**

- Do not construct Lenis. Do not build the GSAP timelines. Keep the current global CSS kill switch until the GSAP path is proven to reveal content itself.

**Overlays**

- Gift modal and drawer keep owning scroll lock through `is-scroll-locked`. GSAP must not call `ScrollTrigger.normalizeScroll` or `lenis.start` while a dialog is open.

---

## 17. Recommended phased implementation plan

This is a plan, not work that was done.

**Phase 0 — Assets, before motion.**  
Replace the course hero and the phone hero. Deduplicate the footer base64. Confirm the academy video does not download on a coarse pointer until it is needed. Re-measure FCP and transferred bytes at 390 and 1440.

**Phase 1 — One GSAP context, entrances only.**  
Homepage hero copy (already 0.72s), academy title, about portrait, gift silk left as CSS. Desktop only. Reduced motion builds nothing. No ScrollTrigger.

**Phase 2 — Clock.**  
If Phase 1 stays, move Lenis `raf` onto `gsap.ticker` and remove the wake loop. Re-run the 2,400px glide and compare worst frame to the 17ms baseline in this document.

**Phase 3 — Inner pages.**  
Course page only after Phase 0. Checkout and library get no scroll scenes. Purchase bar stays an IntersectionObserver.

**Phase 4 — Creative pass.**  
Vary entrances so the page is not one fade-up repeated. Still 12–24px, still under 1.2s, still transform and opacity. Judge on a device, against the numbers above.

Stop the phase if a glide’s worst frame moves from the high teens into a sustained 32ms or worse.

---

## 18. Risk assessment

| Change | Risk if done carelessly |
|---|---|
| Adding ScrollTrigger beside the current observers | Double measurement on scroll, the failure mode already documented at `studio.js` 400–404 |
| GSAP ticker plus the current Lenis loop | Two clocks, extra main-thread time during every glide |
| SplitText on Arabic | Broken joining and clipped marks |
| Animating the footer mask or adding blur to the header | Paint on every scroll frame, which the removed backdrop blur had already caused |
| Starting Lenis on touch | Lost native momentum, fights the fixed header and the course purchase bar |
| Rewriting the gift lock | Modal scroll or a stuck page scroll |
| Touching the 51 MB course image inside a “motion” change | Easy to ship a visual crop the project did not ask for |

The safe path is Phase 0, then entrance-only GSAP, with Lenis left as the only smooth scroll.

---

## 19. Remaining unknowns

- No LCP element timestamp. The hero image is the likely candidate. The buffered `largest-contentful-paint` entry was empty in these traces.
- No CLS and no INP.
- No trace at 320, 768, 1024, or 1920.
- No physical iPhone or Android device. Touch behavior was Chrome’s touch emulation (`pointer: coarse`, `hover: none`).
- No production gzip or HTTP/2 numbers. Local transfer sizes are uncompressed.
- The 19s `hero-phone.png` duration is a local embedded-browser observation. A throttled network profile was not applied. The file size stands either way.
- `ar/` was not diffed file-by-file against the root Arabic pages.
- Course page runtime was not loaded, on purpose, because of the 49.5 MB image.
- Whether `Mixxxx.mp4` is referenced from a CMS or a page outside `seham-studio` was not checked.

---

## 20. Final verdict

The current project is ready for a restrained GSAP entrance layer.

It is not ready for an advanced ScrollTrigger and smooth-scroll rebuild. Smooth scrolling already exists, in one place, and it measured a 17ms worst frame on a 2,400px glide in this browser. ScrollTrigger is not installed. Adding it on top of the chapter observer, the reveal observers, and Lenis would recreate the scroll-time layout cost the code has already been trimmed to avoid.

The motion work that would actually change the feel of the site is downstream of three files: the 49.5 MB course photograph, the 1.8 MB phone hero, and the four-times-inlined footer silk in `studio.css`. Until those are handled, new animation will be polishing a page whose weight is elsewhere.

Lenis should stay. Native touch should stay. Arabic text should stay in whole lines. GSAP, when it comes, should be one context, one ticker, and no pins.
