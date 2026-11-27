/**
 * Synchronous isolation flags (?perf=A–H) — must run before studio.js (defer).
 * A: native baseline, no decorative motion
 * B: native + CSS entrances
 * C: native + GSAP
 * D: Lenis only
 * E: Lenis + GSAP (legacy stack)
 * F: full motion, video off
 * G: full motion, no hero/header decor
 * H: full motion + paint isolation hooks
 */
(() => {
  const mode = (new URLSearchParams(location.search).get("perf") || "").toUpperCase();
  if (!mode) return;
  const root = document.documentElement;
  root.dataset.sehamPerf = mode;
  const flags = {
    A: { lenis: false, gsap: false, decor: false, headerSig: false, video: true },
    B: { lenis: false, gsap: false, decor: true, headerSig: false, video: true },
    C: { lenis: false, gsap: true, decor: true, headerSig: true, video: true },
    D: { lenis: true, gsap: false, decor: true, headerSig: true, video: true },
    E: { lenis: true, gsap: true, decor: true, headerSig: true, video: true },
    F: { lenis: true, gsap: true, decor: true, headerSig: true, video: false },
    G: { lenis: true, gsap: true, decor: false, headerSig: false, video: true },
    H: {
      lenis: true,
      gsap: true,
      decor: true,
      headerSig: true,
      video: true,
      paintIsolate: true,
    },
  };
  window.__sehamPerfDiag = flags[mode] || flags.E;
  if (mode !== "A" && mode !== "B") {
    root.classList.remove("motion-native");
  }
})();