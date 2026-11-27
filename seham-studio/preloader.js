/* Seham Latino — handwritten signature preloader (CSS-driven, no GSAP). */
(function () {
  "use strict";

  var PRELOADER_ENABLED = true;
  var intro = document.getElementById("intro");
  var timer = null;

  function finish() {
    if (!intro) return;
    intro.classList.remove("run");
    intro.hidden = true;
    intro.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("is-preloading");
    document.body.classList.remove("is-preloading");
    try {
      document.dispatchEvent(new CustomEvent("seham:preload-done"));
    } catch (e) {
      /* ignore */
    }
  }

  if (!PRELOADER_ENABLED || !intro) {
    document.documentElement.classList.remove("is-preloading");
    document.body.classList.remove("is-preloading");
    if (intro) intro.hidden = true;
    try {
      document.dispatchEvent(new CustomEvent("seham:preload-done"));
    } catch (e2) {
      /* ignore */
    }
    return;
  }

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var duration = reduced ? 170 : 1960;

  function play() {
    clearTimeout(timer);
    intro.hidden = false;
    intro.removeAttribute("hidden");
    intro.setAttribute("aria-hidden", "true");
    document.documentElement.classList.add("is-preloading");
    document.body.classList.add("is-preloading");

    intro.classList.remove("run");
    void intro.offsetWidth;
    intro.classList.add("run");

    timer = setTimeout(finish, duration);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", play, { once: true });
  } else {
    play();
  }
})();