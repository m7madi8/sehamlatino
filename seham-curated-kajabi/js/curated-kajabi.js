/* Curated section scroll-in (optional). Add class js-motion on <html> via this script. */
(function () {
  "use strict";
  var root = document.documentElement;
  if (root.classList.contains("js-motion")) return;
  root.classList.add("js-motion");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    document.querySelectorAll(".curated, .closing-canvas").forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  function sectionalIn(sel) {
    var nodes = document.querySelectorAll(sel);
    if (!nodes.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: "16% 0px 10% 0px" }
    );
    nodes.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.96) {
        el.classList.add("is-in");
      } else {
        io.observe(el);
        window.setTimeout(function () {
          if (!el.classList.contains("is-in")) {
            el.classList.add("is-in");
            try { io.unobserve(el); } catch (_) {}
          }
        }, 2200);
      }
    });
  }

  sectionalIn(".curated");
  var canvas = document.querySelector(".closing-canvas");
  if (canvas) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -5% 0px" }
    );
    if (canvas.getBoundingClientRect().top < window.innerHeight) {
      canvas.classList.add("is-in");
    } else {
      cio.observe(canvas);
    }
  }
})();
