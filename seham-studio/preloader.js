/* Seham Latino — brand preloader. Faster + smoother than preview defaults. */
(function () {
  "use strict";

  var intro = document.getElementById("intro");
  if (!intro || typeof gsap === "undefined") {
    document.documentElement.classList.remove("is-preloading");
    if (intro) intro.hidden = true;
    return;
  }

  var CENTS = [
    [423.8, 91.3], [414.9, 61.1], [368.3, 56.6], [317.9, 65.9], [266.1, 85.2],
    [220.4, 119.6], [204.2, 163.3], [218.1, 206.3], [256.7, 241.6], [301.6, 266.5],
    [342.0, 299.4], [360.8, 343.6], [354.6, 388.5], [322.6, 442.9], [280.7, 476.9],
    [236.4, 499.6], [190.0, 513.5], [143.6, 515.9], [102.0, 501.5], [80.9, 468.7],
    [94.5, 423.4], [151.5, 376.7], [196.9, 356.1], [245.2, 338.9], [275.0, 329.6],
    [378.2, 305.2], [400.3, 308.8], [412.2, 327.8], [434.8, 311.8], [449.3, 291.6],
    [496.3, 254.9], [509.3, 257.8], [482.8, 289.3], [476.7, 306.1], [493.6, 317.3],
    [519.1, 323.9], [555.3, 302.8], [576.8, 304.1], [573.3, 311.3], [591.5, 326.4],
    [619.1, 324.7], [638.4, 314.4], [655.9, 316.6], [677.7, 311.7], [701.3, 313.1],
    [708.2, 313.7], [731.8, 309.5], [796.7, 291.5],
  ];
  var N = CENTS.length;

  var mark = intro.querySelector(".mark");
  var curtain = intro.querySelector(".curtain");
  var sl = Array.prototype.slice.call(intro.querySelectorAll(".sl"));
  var sigFull = intro.querySelector("#sigFull");
  var lr = intro.querySelector("#lrRect");
  var spark = intro.querySelector("#spark");
  var gem = intro.querySelector("#gem");
  var rl = intro.querySelector("#rl");
  var rr = intro.querySelector("#rr");
  var rg = intro.querySelector("#rg");
  var tag = intro.querySelector("#tag");
  var pen = intro.querySelector("#pen");
  var tl = null;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ~32% faster than preview; eases tuned for silkier motion */
  var SPEED = 1.32;

  function write(p) {
    for (var i = 0; i < N; i++) {
      var v = Math.min(1, Math.max(0, p - i));
      sl[i].style.opacity = String(v);
    }
    var k = Math.min(N - 1, Math.max(0, p - 0.5));
    var a = Math.floor(k);
    var b = Math.min(N - 1, a + 1);
    var f = k - a;
    pen.setAttribute("cx", CENTS[a][0] + (CENTS[b][0] - CENTS[a][0]) * f);
    pen.setAttribute("cy", CENTS[a][1] + (CENTS[b][1] - CENTS[a][1]) * f);
  }

  function reset(full) {
    write(full ? N + 2 : 0);
    sigFull.style.opacity = full ? "1" : "0";
    pen.style.opacity = "0";
    lr.setAttribute("width", full ? "600" : "0");
    gsap.set([rl, rr], { scaleX: full ? 1 : 0, force3D: true });
    gsap.set([gem, rg, spark], {
      scale: full ? 1 : 0,
      transformOrigin: "50% 50%",
      force3D: true,
    });
    gsap.set(tag, { opacity: full ? 1 : 0, y: full ? 0 : 4, force3D: true });
  }

  function finish() {
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

  function play() {
    if (tl) tl.kill();
    intro.hidden = false;
    gsap.set(intro, { opacity: 1, display: "block" });
    gsap.set(curtain, { yPercent: 0, force3D: true });
    gsap.set(mark, {
      xPercent: -50,
      yPercent: -50,
      y: 0,
      opacity: 1,
      scale: 0.988,
      force3D: true,
    });

    var vh = innerHeight;
    tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: finish,
    });
    tl.timeScale(SPEED);

    if (reduced) {
      reset(true);
      gsap.set(mark, { scale: 1 });
      tl.to(intro, { opacity: 0, duration: 0.35, delay: 0.55, ease: "power2.out" });
      return;
    }

    reset(false);
    var o = { p: 0 };

    tl.addLabel("w", 0.18)
      .set(pen, { opacity: 1 }, "w")
      .to(
        o,
        {
          p: N + 1,
          duration: 1.28,
          ease: "sine.inOut",
          onUpdate: function () {
            write(o.p);
          },
        },
        "w"
      )
      .to(pen, { opacity: 0, duration: 0.2, ease: "power1.out" }, "w+=1.12")
      .set(sigFull, { opacity: 1 }, "w+=1.28")
      .to(mark, { scale: 1, duration: 1.65, ease: "power2.out" }, "w")
      .to(
        { v: 0 },
        {
          v: 560,
          duration: 0.5,
          ease: "power2.inOut",
          onUpdate: function () {
            lr.setAttribute("width", String(this.targets()[0].v));
          },
        },
        "w+=0.78"
      )
      .to(gem, { scale: 1, duration: 0.42, ease: "back.out(1.8)" }, "w+=1.18")
      .to(rg, { scale: 1, duration: 0.4, ease: "back.out(1.7)" }, "w+=0.86")
      .to([rl, rr], { scaleX: 1, duration: 0.62, ease: "expo.out" }, "w+=0.9")
      .to(tag, { opacity: 1, y: 0, duration: 0.48, ease: "power2.out" }, "w+=1.05")
      .to(spark, { scale: 1, duration: 0.52, ease: "back.out(2)" }, "w+=1.22")
      .to(
        spark,
        { scale: 1.12, duration: 0.28, yoyo: true, repeat: 1, ease: "sine.inOut" },
        "w+=1.7"
      )
      .addLabel("x", "w+=2.05")
      .to(
        mark,
        { y: -vh * 0.14, opacity: 0, duration: 0.55, ease: "power2.inOut" },
        "x"
      )
      .to(
        curtain,
        { yPercent: -102, duration: 0.82, ease: "expo.inOut" },
        "x+=0.08"
      );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", play, { once: true });
  } else {
    play();
  }
})();
