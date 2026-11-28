/**
 * Seham Latino — THE RHYTHM OF MOTION (rhythm-3)
 * Desktop fine-pointer entrances; fail-open legacy unlocks.
 * No ScrollTrigger. No SplitText.
 */
(() => {
  const ROOT = document.documentElement;
  const PAGE = document.body.classList;
  const BOOTED = { value: false };
  let booting = false;
  const DESKTOP_CHOREO =
    "(min-width: 761px) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)";

  if (window.__sehamMotion?.destroy) {
    try {
      window.__sehamMotion.destroy();
    } catch (_) {
      /* ignore */
    }
  }

  const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
  const perfDiag = window.__sehamPerfDiag || null;
  let scrollSpeed = 0;
  let scrollSampleY = window.scrollY || 0;
  let scrollSampleT = performance.now();
  addEventListener(
    "scroll",
    () => {
      const t = performance.now();
      const y = window.scrollY || 0;
      const dt = Math.max(12, t - scrollSampleT);
      scrollSpeed = Math.abs(y - scrollSampleY) / dt;
      scrollSampleY = y;
      scrollSampleT = t;
    },
    { passive: true }
  );

  function scrollIsFast() {
    return scrollSpeed > 4.2;
  }

  const TOKENS = {
    easePrimary: "power3.out",
    easeSoft: "power2.out",
    easeEditorial: "power4.out",
    micro: 0.3,
    text: 0.72,
    textShort: 0.58,
    media: 0.82,
    stagger: 0.06,
    staggerTight: 0.05,
    yHero: 20,
    yText: 16,
    ySoft: 12,
    yWhisper: 8,
  };

  const state = {
    gsap: null,
    contexts: [],
    observers: [],
    failsafeTimers: [],
    timelines: 0,
    sections: {
      hero: false,
      academy: false,
      testimonials: false,
      about: false,
      services: false,
      gift: false,
      finalCta: false,
    },
  };

  const CHOREO_SELECTORS = [
    ".hero-enter--2",
    ".hero-enter--3",
    ".hero-enter--4",
    ".academy-display",
    ".academy-lead",
    ".sm-academy-copy > *",
    ".academy-flagship",
    ".academy-upcoming-heading",
    ".academy-soon",
    ".freedom-portrait-img",
    ".freedom-manifesto",
    ".freedom-voices",
    ".freedom-quote.is-active",
    ".ap-photo",
    ".ap-title",
    ".ap-bio",
    ".curated-head",
    ".xp",
    ".xp-media img",
    ".xp-photo img",
    ".sg-photo",
    ".sg-copy > *",
    ".final-cta h2",
    ".final-cta .cta-actions",
  ].join(",");

  function clearGsapInline(elements) {
    (elements || []).forEach((el) => {
      if (!el) return;
      if (window.gsap) {
        window.gsap.set(el, { clearProps: "opacity,transform,visibility" });
      }
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("visibility");
    });
  }

  function unlockAllLegacy() {
    document.querySelectorAll(".academy, .curated").forEach((el) => {
      el.classList.add("is-in");
    });
    document.querySelectorAll(".reveal-line, .motion-ready").forEach((el) => {
      el.classList.add("is-visible");
    });
    document.querySelectorAll(".freedom[data-freedom-portrait]").forEach((el) => {
      el.classList.add("is-portrait-in");
    });
    document.querySelectorAll(".about-portrait").forEach((el) => {
      el.classList.add("ap-in", "ap-done");
      const contour = el.querySelector(".ap-contour path");
      if (contour) contour.style.strokeDashoffset = "0";
    });
    document.querySelectorAll(".closing-canvas").forEach((el) => {
      el.classList.add("is-in");
    });
  }

  function failSafeVisible() {
    ROOT.classList.remove("sm-gsap-pilot");
    ROOT.classList.add("sm-gsap-fallback");
    clearGsapInline(document.querySelectorAll(CHOREO_SELECTORS));
    unlockAllLegacy();
  }

  function claimRevealLines() {
    document.querySelectorAll(".freedom-inner.reveal-line, .final-cta.reveal-line").forEach((el) => {
      el.classList.add("sm-choreo-claim");
    });
  }

  function observeOnce(el, onEnter, options) {
    if (!el || el.dataset.smSeen === "1") return;
    let fired = false;
    const run = () => {
      if (fired) return;
      fired = true;
      el.dataset.smSeen = "1";
      unlockSectionLegacy(el);
      if (scrollIsFast()) {
        return;
      }
      onEnter(el);
    };

    if (el.getBoundingClientRect().top < window.innerHeight * 0.94) {
      run();
      return;
    }

    if (!("IntersectionObserver" in window)) {
      run();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        run();
      },
      Object.assign({ threshold: 0.02, rootMargin: "18% 0px 10% 0px" }, options)
    );
    io.observe(el);
    state.observers.push(io);

    const failsafe = window.setTimeout(() => {
      if (el.dataset.smSeen !== "1") {
        unlockSectionLegacy(el);
        run();
      }
    }, 2600);
    state.failsafeTimers.push(failsafe);
  }

  function unlockSectionLegacy(el) {
    if (!el) return;
    if (el.classList.contains("academy") || el.closest(".academy")) {
      (el.classList.contains("academy") ? el : el.closest(".academy"))?.classList.add("is-in");
    }
    if (el.classList.contains("curated") || el.closest(".curated")) {
      (el.classList.contains("curated") ? el : el.closest(".curated"))?.classList.add("is-in");
    }
    if (el.classList.contains("freedom") || el.closest(".freedom")) {
      const freedom = el.classList.contains("freedom") ? el : el.closest(".freedom");
      freedom?.classList.add("is-portrait-in");
      freedom?.querySelector(".freedom-inner")?.classList.add("is-visible");
    }
    if (el.classList.contains("final-cta")) {
      el.classList.add("is-visible");
    }
    if (el.classList.contains("about-portrait")) {
      el.classList.add("ap-in");
    }
  }

  function fromUp(gsap, tl, target, vars, position) {
    if (!target) return;
    const tweens = { ...vars, ease: vars.ease || TOKENS.easePrimary };
    if (position !== undefined) {
      tl.from(target, tweens, position);
    } else {
      tl.from(target, tweens);
    }
  }

  function waitHeroReady(hero, cb) {
    if (!hero) return;
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      cb();
    };

    if (hero.classList.contains("is-cinema-entered")) {
      run();
      return;
    }

    const obs = new MutationObserver(() => {
      if (hero.classList.contains("is-cinema-entered")) {
        obs.disconnect();
        run();
      }
    });
    obs.observe(hero, { attributes: true, attributeFilter: ["class"] });
    state.observers.push({ disconnect: () => obs.disconnect() });

    const afterPreload = () => {
      window.setTimeout(() => {
        if (!hero.classList.contains("is-cinema-entered")) {
          hero.classList.add("is-cinema-entered");
        }
        run();
      }, 60);
    };

    if (ROOT.classList.contains("is-preloading")) {
      document.addEventListener("seham:preload-done", afterPreload, { once: true });
    } else {
      afterPreload();
    }

    window.setTimeout(() => {
      if (!hero.classList.contains("is-cinema-entered")) {
        hero.classList.add("is-cinema-entered");
      }
      run();
    }, 1400);
  }

  function choreoHero(gsap) {
    const hero = document.querySelector("[data-cinematic-hero]");
    if (!hero) return;
    const h1 = hero.querySelector(".hero-enter--2");
    const lede = hero.querySelector(".hero-enter--3");
    const actions = hero.querySelector(".hero-enter--4");
    if (!h1) return;

    waitHeroReady(hero, () => {
      const tl = gsap.timeline({ defaults: { ease: TOKENS.easeEditorial } });
      fromUp(gsap, tl, h1, { opacity: 0, y: TOKENS.yHero, duration: TOKENS.text }, 0);
      fromUp(gsap, tl, lede, { opacity: 0, y: TOKENS.yText, duration: TOKENS.textShort }, "-=0.42");
      fromUp(gsap, tl, actions, { opacity: 0, y: TOKENS.ySoft, duration: TOKENS.textShort }, "-=0.34");
      tl.eventCallback("onComplete", () => {
        clearGsapInline([h1, lede, actions].filter(Boolean));
      });
      state.timelines += 1;
      state.sections.hero = true;
    });
  }

  function choreoAcademy(gsap) {
    const section = document.querySelector(".academy");
    if (!section) return;
    const body = section.querySelector(".academy-flagship-body");
    if (!body) return;
    body.classList.add("sm-academy-copy");

    observeOnce(section, () => {
      section.classList.add("is-in");
      const settleSel =
        ".academy-display, .academy-lead, .sm-academy-copy > *, .academy-flagship, .academy-upcoming-heading, .academy-soon";
      const display = section.querySelector(".academy-display");
      const lead = section.querySelector(".academy-lead");
      const flagship = section.querySelector(".academy-flagship");
      const upcomingHead = section.querySelector(".academy-upcoming-heading");
      const soonCards = section.querySelectorAll(".academy-soon");
      const copyKids = section.querySelectorAll(".sm-academy-copy > *");

      const tl = gsap.timeline({
        defaults: { ease: TOKENS.easePrimary },
        onComplete: () => {
          section.classList.add("sm-academy-done");
          clearGsapInline(section.querySelectorAll(settleSel));
        },
      });

      const intro = [display, lead].filter(Boolean);
      if (intro.length) {
        fromUp(gsap, tl, intro, { opacity: 0, y: TOKENS.yText, duration: TOKENS.textShort, stagger: 0.05 }, 0);
      }
      fromUp(gsap, tl, flagship, { opacity: 0, y: TOKENS.ySoft, duration: TOKENS.textShort }, "-=0.32");
      if (copyKids.length) {
        fromUp(gsap, tl, copyKids, { opacity: 0, y: TOKENS.yWhisper, duration: TOKENS.textShort, stagger: 0.04 }, "-=0.38");
      }
      if (upcomingHead) fromUp(gsap, tl, upcomingHead, { opacity: 0, y: TOKENS.ySoft, duration: TOKENS.textShort }, "-=0.28");
      if (soonCards.length) {
        fromUp(gsap, tl, soonCards, { opacity: 0, y: TOKENS.yWhisper, duration: TOKENS.textShort, stagger: TOKENS.staggerTight }, "-=0.2");
      }

      state.timelines += 1;
      state.sections.academy = true;
    });
  }

  function choreoTestimonials(gsap) {
    const section = document.querySelector(".freedom");
    if (!section) return;

    observeOnce(section, () => {
      section.classList.add("is-portrait-in");
      section.querySelector(".freedom-inner")?.classList.add("is-visible");

      const tl = gsap.timeline({
        defaults: { ease: TOKENS.easeSoft },
        onComplete: () => {
          clearGsapInline(section.querySelectorAll(".freedom-portrait-img, .freedom-manifesto, .freedom-voices, .freedom-quote.is-active"));
        },
      });

      const portrait = section.querySelector(".freedom-portrait-img");
      const copy = [
        section.querySelector(".freedom-manifesto"),
        section.querySelector(".freedom-voices"),
        section.querySelector(".freedom-quote.is-active"),
      ].filter(Boolean);

      fromUp(gsap, tl, portrait, { opacity: 0, y: TOKENS.yText, duration: TOKENS.media }, 0);
      if (copy.length) {
        fromUp(gsap, tl, copy, { opacity: 0, y: TOKENS.ySoft, duration: TOKENS.textShort, stagger: 0.06 }, "-=0.45");
      }

      state.timelines += 1;
      state.sections.testimonials = true;
    });
  }

  function choreoAbout(gsap) {
    const section = document.querySelector(".about-portrait");
    if (!section) return;
    section.classList.add("sm-about-pilot");

    observeOnce(section, () => {
      const photo = section.querySelector(".ap-photo");
      const title = section.querySelector(".ap-title");
      const bio = section.querySelector(".ap-bio");
      const contour = section.querySelector(".ap-contour path");

      const tl = gsap.timeline({
        defaults: { ease: TOKENS.easeSoft },
        onComplete: () => {
          section.classList.add("ap-in", "ap-done");
          if (contour) contour.style.strokeDashoffset = "0";
          clearGsapInline([photo, title, bio].filter(Boolean));
        },
      });

      fromUp(gsap, tl, photo, { opacity: 0, y: TOKENS.yText, duration: TOKENS.media }, 0);
      fromUp(gsap, tl, title, { opacity: 0, y: TOKENS.ySoft, duration: TOKENS.text }, "-=0.38");
      fromUp(gsap, tl, bio, { opacity: 0, y: TOKENS.yWhisper, duration: TOKENS.textShort }, "-=0.42");

      state.timelines += 1;
      state.sections.about = true;
    });
  }

  function choreoServices(gsap) {
    const section = document.querySelector(".curated");
    if (!section) return;

    observeOnce(section, () => {
      section.classList.add("is-in");

      const tl = gsap.timeline({
        defaults: { ease: TOKENS.easePrimary },
        onComplete: () => {
          clearGsapInline(section.querySelectorAll(".curated-head, .xp, .xp-media img, .xp-photo img"));
        },
      });

      const head = section.querySelector(".curated-head");
      const cards = section.querySelectorAll(".xp");
      fromUp(gsap, tl, head, { opacity: 0, y: TOKENS.yText, duration: TOKENS.text }, 0);
      if (cards.length) {
        fromUp(gsap, tl, cards, { opacity: 0, y: TOKENS.ySoft, duration: TOKENS.textShort, stagger: TOKENS.stagger }, "-=0.36");
      }
      state.timelines += 1;
      state.sections.services = true;
    });
  }

  function choreoGift(gsap) {
    const section = document.querySelector(".sg");
    if (!section) return;

    observeOnce(section, () => {
      const tl = gsap.timeline({
        defaults: { ease: TOKENS.easeEditorial },
        onComplete: () => {
          clearGsapInline(section.querySelectorAll(".sg-photo, .sg-copy > *"));
        },
      });
      const photo = section.querySelector(".sg-photo");
      const copy = section.querySelector(".sg-copy");

      fromUp(gsap, tl, photo, { opacity: 0, y: TOKENS.yText, duration: TOKENS.media }, 0);
      if (copy) {
        fromUp(gsap, tl, copy, { opacity: 0, y: TOKENS.ySoft, duration: TOKENS.textShort }, "-=0.42");
      }
      state.timelines += 1;
      state.sections.gift = true;
    });
  }

  function choreoFinalCta(gsap) {
    const section = document.querySelector(".final-cta");
    if (!section) return;

    observeOnce(section, () => {
      section.classList.add("is-visible");

      const tl = gsap.timeline({
        defaults: { ease: TOKENS.easeSoft },
        onComplete: () => {
          clearGsapInline(section.querySelectorAll("h2, .cta-actions"));
        },
      });
      const h2 = section.querySelector("h2");
      const actions = section.querySelector(".cta-actions");
      fromUp(gsap, tl, h2, { opacity: 0, y: TOKENS.yText, duration: TOKENS.text }, 0);
      fromUp(gsap, tl, actions, { opacity: 0, y: TOKENS.yWhisper, duration: TOKENS.textShort }, "-=0.4");
      state.timelines += 1;
      state.sections.finalCta = true;
    });
  }

  function initChoreography(gsap) {
    if (!PAGE.contains("page-index")) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_CHOREO, () => {
        ROOT.classList.add("sm-gsap-pilot");
        claimRevealLines();
        choreoHero(gsap);
        choreoAcademy(gsap);
        choreoTestimonials(gsap);
        choreoAbout(gsap);
        choreoServices(gsap);
        choreoGift(gsap);
        choreoFinalCta(gsap);

        return () => {
          ROOT.classList.remove("sm-gsap-pilot");
          clearGsapInline(document.querySelectorAll(CHOREO_SELECTORS));
          unlockAllLegacy();
        };
      });
    });

    state.contexts.push(ctx);

    reduceMq.addEventListener("change", () => {
      if (reduceMq.matches) destroyAll(gsap);
    });
  }

  function destroyAll(gsap) {
    state.failsafeTimers.forEach((id) => window.clearTimeout(id));
    state.failsafeTimers.length = 0;
    state.contexts.forEach((c) => {
      try {
        c.revert();
      } catch (_) {
        /* ignore */
      }
    });
    state.contexts.length = 0;
    state.observers.forEach((o) => {
      try {
        o.disconnect();
      } catch (_) {
        /* ignore */
      }
    });
    state.observers.length = 0;
    failSafeVisible();
    Object.keys(state.sections).forEach((k) => {
      state.sections[k] = false;
    });
    if (gsap) gsap.globalTimeline.clear();
    state.timelines = 0;
  }

  function whenGsapReady(cb, attempt) {
    const n = attempt || 0;
    if (window.gsap && typeof window.gsap.timeline === "function") {
      cb(window.gsap);
      return;
    }
    if (n > 50) {
      failSafeVisible();
      return;
    }
    window.setTimeout(() => whenGsapReady(cb, n + 1), 32);
  }

  function boot() {
    if (BOOTED.value || booting) return;
    if (reduceMq.matches || (perfDiag && perfDiag.gsap === false)) {
      BOOTED.value = true;
      failSafeVisible();
      return;
    }

    if (!window.matchMedia(DESKTOP_CHOREO).matches) {
      BOOTED.value = true;
      return;
    }

    booting = true;
    whenGsapReady((gsap) => {
      booting = false;
      if (BOOTED.value) return;
      BOOTED.value = true;
      state.gsap = gsap;
      gsap.config({ nullTargetWarn: false, autoSleep: 90, force3D: true });

      try {
        initChoreography(gsap);
      } catch (err) {
        console.warn("[seham-motion] choreography failed", err);
        failSafeVisible();
        BOOTED.value = false;
        return;
      }

      window.__sehamMotion = {
        version: "rhythm-3.1",
        tokens: TOKENS,
        gsapVersion: gsap.version,
        state,
        destroy() {
          BOOTED.value = false;
          destroyAll(gsap);
        },
      };
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
  window.addEventListener("load", () => {
    if (!BOOTED.value && !reduceMq.matches) boot();
  });
})();