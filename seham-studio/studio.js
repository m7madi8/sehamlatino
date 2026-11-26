(() => {
  /* Fonts: non-blocking injection (CSS no longer @import-blocks parse) */
  if (!document.getElementById("seham-fonts")) {
    const pre1 = document.createElement("link");
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";
    const pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "";
    const fonts = document.createElement("link");
    fonts.id = "seham-fonts";
    fonts.rel = "stylesheet";
    fonts.href =
      "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400&family=Tajawal:wght@400;500;700&display=swap";
    document.head.append(pre1, pre2, fonts);
  }

  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".read-progress");
  const drawer = document.querySelector("#drawer");
  const trigger = document.querySelector(".menu-trigger");
  const closeBtn = document.querySelector(".menu-close");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Single scroll rAF bus (header + progress) ---------- */
  let scrollTicking = false;
  let lastScrolled = null;
  let lastProgress = -1;

  function updateChrome() {
    const y = window.scrollY || 0;
    if (header) {
      const shouldScroll = y > 18;
      if (shouldScroll !== lastScrolled) {
        header.classList.toggle("scrolled", shouldScroll);
        lastScrolled = shouldScroll;
      }
    }
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      const rounded = Math.round(ratio * 1000) / 1000;
      if (rounded !== lastProgress) {
        progress.style.transform = "scaleX(" + rounded + ")";
        lastProgress = rounded;
      }
    }
    scrollTicking = false;
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateChrome);
  }

  addEventListener("scroll", onScroll, { passive: true });
  updateChrome();

  /* ---------- Editorial header signature ---------- */
  const BRAND_MOTTO = "DANCE · LOVE · GROW";
  const pageLang = (document.documentElement.lang || "ar").toLowerCase().startsWith("en")
    ? "en"
    : "ar";
  const isHomepage = document.body.classList.contains("page-index");
  const focusedShell =
    document.body.classList.contains("page-checkout") ||
    document.body.classList.contains("page-account") ||
    document.body.classList.contains("page-library") ||
    document.body.classList.contains("page-register") ||
    document.body.classList.contains("page-lesson") ||
    document.body.classList.contains("distraction-light");

  const CHAPTERS = [
    {
      sel: ".home-hero",
      ar: BRAND_MOTTO,
      en: BRAND_MOTTO,
      script: "en",
    },
    {
      sel: ".academy",
      ar: "اكتشفي إيقاعك",
      en: "Discover Your Rhythm",
      script: "auto",
    },
    {
      sel: ".freedom",
      ar: "مساحة لتكوني أنت",
      en: "Space to Be Yourself",
      script: "auto",
    },
    {
      sel: ".about-portrait",
      ar: "الحركة لغتي",
      en: "Movement Is My Language",
      script: "auto",
    },
    {
      sel: ".curated",
      ar: "لنتحرك معا",
      en: "Let's Move Together",
      script: "auto",
    },
    {
      sel: ".final-cta",
      ar: "رحلتك تبدأ هنا",
      en: "Your Journey Begins Here",
      script: "auto",
    },
    {
      sel: ".footer",
      ar: BRAND_MOTTO,
      en: BRAND_MOTTO,
      script: "en",
    },
  ];

  function resolveChapterCopy(chapter) {
    const text = pageLang === "en" ? chapter.en : chapter.ar;
    const script =
      chapter.script === "auto" ? (pageLang === "en" ? "en" : "ar") : chapter.script;
    return { text, script };
  }

  function mountEditorialSignature() {
    if (!header || focusedShell) return null;
    if (header.querySelector(".head-signature")) {
      return header.querySelector(".head-signature");
    }

    const sig = document.createElement("p");
    sig.className = "head-signature";
    sig.setAttribute("aria-hidden", "true");
    sig.dataset.script = "en";

    const textEl = document.createElement("span");
    textEl.className = "head-signature-text";
    textEl.textContent = BRAND_MOTTO;
    sig.appendChild(textEl);

    const actions = header.querySelector(".head-actions");
    if (actions) header.insertBefore(sig, actions);
    else header.appendChild(sig);

    return sig;
  }

  const signature = mountEditorialSignature();

  if (signature) {
    let activeKey = "static";
    let transitionLock = false;
    let pendingKey = null;
    const textNode = signature.querySelector(".head-signature-text");
    const mqSig = matchMedia("(min-width: 1100px)");

    function applyCopy(copy, animate) {
      if (!textNode) return;
      const next = copy.text;
      const script = copy.script;
      if (textNode.textContent === next && signature.dataset.script === script) return;

      const commit = () => {
        textNode.textContent = next;
        signature.dataset.script = script;
        // Keep English motto glyph order stable inside RTL documents
        if (script === "en") signature.setAttribute("dir", "ltr");
        else signature.removeAttribute("dir");
        if (pageLang === "ar" && script === "ar") signature.setAttribute("lang", "ar");
        else signature.setAttribute("lang", "en");
      };

      if (!animate || reduceMotion || !mqSig.matches) {
        signature.classList.remove("is-leaving", "is-entering");
        commit();
        return;
      }

      transitionLock = true;
      signature.classList.remove("is-entering");
      signature.classList.add("is-leaving");

      const dur = 380;
      window.setTimeout(() => {
        commit();
        signature.classList.remove("is-leaving");
        // force reflow so entering animation restarts cleanly
        void textNode.offsetWidth;
        signature.classList.add("is-entering");
        window.setTimeout(() => {
          signature.classList.remove("is-entering");
          transitionLock = false;
          if (pendingKey && pendingKey !== activeKey) {
            const key = pendingKey;
            pendingKey = null;
            setActiveChapter(key, true);
          } else {
            pendingKey = null;
          }
        }, dur);
      }, dur);
    }

    function setActiveChapter(key, force) {
      if (!force && key === activeKey) return;
      if (transitionLock) {
        pendingKey = key;
        return;
      }
      activeKey = key;
      if (key === "static") {
        applyCopy({ text: BRAND_MOTTO, script: "en" }, true);
        return;
      }
      const chapter = CHAPTERS.find((c) => c.sel === key);
      if (!chapter) return;
      applyCopy(resolveChapterCopy(chapter), true);
    }

    if (isHomepage && "IntersectionObserver" in window) {
      const observed = CHAPTERS.map((c) => {
        const el = document.querySelector(c.sel);
        return el ? { el, key: c.sel } : null;
      }).filter(Boolean);

      let visible = new Set();
      let pickRaf = 0;

      const pickActive = () => {
        pickRaf = 0;
        if (document.documentElement.classList.contains("is-scroll-locked")) return;
        if (!mqSig.matches) return;

        const vh = window.innerHeight || 1;
        const docH = document.documentElement.scrollHeight || 1;
        // Near page end, the footer owns the chapter even if the CTA still crosses the focus line
        const nearEnd = window.scrollY + vh >= docH - vh * 0.28;
        if (nearEnd && visible.has(".footer")) {
          setActiveChapter(".footer", false);
          return;
        }

        // Focus line in the upper-middle viewport — stable, direction-agnostic
        const focusY = vh * 0.36;
        let bestKey = null;
        let bestDist = Infinity;

        observed.forEach(({ el, key }) => {
          if (!visible.has(key)) return;
          const r = el.getBoundingClientRect();
          if (r.bottom <= 0 || r.top >= vh) return;
          // Prefer the section that currently owns the focus line
          if (r.top <= focusY && r.bottom > focusY) {
            const dist = Math.abs((r.top + r.bottom) / 2 - focusY);
            if (dist < bestDist) {
              bestDist = dist;
              bestKey = key;
            }
          }
        });

        // Fallback: nearest section center to the focus line among visible ones
        if (!bestKey) {
          observed.forEach(({ el, key }) => {
            if (!visible.has(key)) return;
            const r = el.getBoundingClientRect();
            const mid = (r.top + r.bottom) / 2;
            const dist = Math.abs(mid - focusY);
            if (dist < bestDist) {
              bestDist = dist;
              bestKey = key;
            }
          });
        }

        if (bestKey) setActiveChapter(bestKey, false);
      };

      const schedulePick = () => {
        if (pickRaf) return;
        pickRaf = requestAnimationFrame(pickActive);
      };

      const chapterIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const item = observed.find((o) => o.el === entry.target);
            if (!item) return;
            if (entry.isIntersecting) visible.add(item.key);
            else visible.delete(item.key);
          });
          schedulePick();
        },
        {
          root: null,
          rootMargin: "-12% 0px -28% 0px",
          /* Fewer thresholds = fewer layout reads during scroll */
          threshold: [0, 0.2, 0.55],
        }
      );

      observed.forEach(({ el }) => chapterIo.observe(el));
      /*
        Chapter changes are driven by IntersectionObserver only.
        Avoid per-frame getBoundingClientRect during scroll — that was a
        primary source of mobile scroll stutter on the homepage.
      */
      let resizePickTimer = 0;
      addEventListener(
        "resize",
        () => {
          clearTimeout(resizePickTimer);
          resizePickTimer = window.setTimeout(schedulePick, 140);
        },
        { passive: true }
      );
      // Seed default
      setActiveChapter(".home-hero", false);
      schedulePick();
    } else {
      setActiveChapter("static", false);
    }
  }

  /* ---------- Scroll lock manager (menu / overlays) ---------- */
  const root = document.documentElement;
  const supportsStableGutter =
    typeof CSS !== "undefined" && CSS.supports && CSS.supports("scrollbar-gutter", "stable");
  let scrollLockCount = 0;
  let lockedScrollY = 0;

  function measureScrollbarWidth() {
    return Math.max(0, window.innerWidth - root.clientWidth);
  }

  function lockScroll() {
    if (scrollLockCount === 0) {
      lockedScrollY = window.scrollY || window.pageYOffset || 0;
      const sbw = measureScrollbarWidth();
      root.dataset.scrollY = String(lockedScrollY);
      root.style.setProperty("--scroll-lock-offset", `${sbw}px`);
      // Compensate only when a classic scrollbar is present and gutter cannot hold the space
      if (sbw > 0 && !supportsStableGutter) {
        root.setAttribute("data-sb-comp", "1");
      } else {
        root.removeAttribute("data-sb-comp");
      }
      root.style.scrollBehavior = "auto";
      root.classList.add("is-scroll-locked");
      // Freeze visual position against any accidental scroll anchoring / focus scrolls
      window.scrollTo(0, lockedScrollY);
    }
    scrollLockCount += 1;
  }

  function unlockScroll() {
    if (scrollLockCount === 0) return;
    scrollLockCount -= 1;
    if (scrollLockCount > 0) return;

    const y = Number(root.dataset.scrollY || lockedScrollY || 0);
    root.classList.remove("is-scroll-locked");
    root.removeAttribute("data-sb-comp");
    root.style.removeProperty("--scroll-lock-offset");
    delete root.dataset.scrollY;

    // Restore exact position without smooth-scroll animation
    window.scrollTo(0, y);
    requestAnimationFrame(() => {
      root.style.scrollBehavior = "";
      if (Math.abs((window.scrollY || 0) - y) > 1) window.scrollTo(0, y);
    });
  }

  if (drawer && trigger && closeBtn) {
    const panel = drawer.querySelector(".drawer-panel") || drawer;
    const navLinks = [...drawer.querySelectorAll(".menu-nav .menu-link, .menu-nav a")];
    navLinks.forEach((a, i) => a.style.setProperty("--i", i));

    // Keep active state truthful to the current page
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const currentFile = path === "" ? "index.html" : path;
    navLinks.forEach((a) => {
      const href = (a.getAttribute("href") || "").split("/").pop()?.toLowerCase();
      if (href && href === currentFile) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    let closing = false;
    let opening = false;
    let lastFocus = null;
    let closeTimer = 0;
    let scrollLockedForDrawer = false;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    function setOriginFromTrigger() {
      /* Kept for API stability — editorial sheet no longer uses origin clip */
    }

    function getFocusable() {
      return [...drawer.querySelectorAll(focusableSelector)].filter((el) => {
        if (el === closeBtn) return true;
        const style = getComputedStyle(el);
        return style.visibility !== "hidden" && style.display !== "none";
      });
    }

    function trapFocus(e) {
      if (e.key !== "Tab" || !drawer.open) return;
      const items = getFocusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function releaseDrawerScrollLock() {
      if (!scrollLockedForDrawer) return;
      scrollLockedForDrawer = false;
      unlockScroll();
    }

    function unlockPage() {
      releaseDrawerScrollLock();
      trigger.setAttribute("aria-expanded", "false");
      drawer.classList.remove("is-open", "is-closing");
      closing = false;
      opening = false;
      const restore = lastFocus && typeof lastFocus.focus === "function" ? lastFocus : trigger;
      try {
        restore.focus({ preventScroll: true });
      } catch (_) {
        restore.focus();
      }
    }

    function focusCloseSafe() {
      try {
        closeBtn.focus({ preventScroll: true });
      } catch (_) {
        closeBtn.focus();
      }
    }

    function openDrawer() {
      if (opening) return;

      // Interrupt an in-progress close so rapid toggles never corrupt lock/scroll state
      if (closing) {
        clearTimeout(closeTimer);
        closeTimer = 0;
        closing = false;
        drawer.classList.remove("is-closing");
        drawer.classList.add("is-open");
        if (!scrollLockedForDrawer) {
          lockScroll();
          scrollLockedForDrawer = true;
        }
        trigger.setAttribute("aria-expanded", "true");
        focusCloseSafe();
        return;
      }

      if (drawer.open) return;
      opening = true;
      lastFocus = document.activeElement;
      drawer.classList.remove("is-closing");

      // Lock before modal paint so scrollbar disappearance cannot shift layout
      if (!scrollLockedForDrawer) {
        lockScroll();
        scrollLockedForDrawer = true;
      }

      drawer.showModal();
      setOriginFromTrigger();
      trigger.setAttribute("aria-expanded", "true");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawer.classList.add("is-open");
          opening = false;
          focusCloseSafe();
        });
      });
    }

    function finishClose() {
      clearTimeout(closeTimer);
      closeTimer = 0;
      if (drawer.open) drawer.close();
      else unlockPage();
    }

    function closeDrawer() {
      if (!drawer.open || closing) return;
      closing = true;
      opening = false;
      setOriginFromTrigger();
      drawer.classList.remove("is-open");
      drawer.classList.add("is-closing");

      if (reduceMotion) {
        finishClose();
        return;
      }

      const onEnd = (e) => {
        if (e.target !== panel) return;
        if (e.propertyName && e.propertyName !== "opacity" && e.propertyName !== "transform") return;
        panel.removeEventListener("transitionend", onEnd);
        finishClose();
      };
      panel.addEventListener("transitionend", onEnd);
      closeTimer = setTimeout(finishClose, 620);
    }

    trigger.addEventListener("click", openDrawer);
    closeBtn.addEventListener("click", closeDrawer);

    drawer.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDrawer();
    });

    drawer.addEventListener("close", () => {
      clearTimeout(closeTimer);
      closeTimer = 0;
      unlockPage();
    });

    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) closeDrawer();
    });

    drawer.addEventListener("keydown", trapFocus);

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeDrawer());
    });

    addEventListener("resize", () => {
      if (drawer.open && !closing) setOriginFromTrigger();
    });
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    document.documentElement.classList.add("js-motion");
    const nodes = [
      ...document.querySelectorAll(
        ".reveal-line, .reveal-media, .reveal-measure, .section-heading, .feature-card, .product-editorial, .course-tile, .social-grid, .upcoming, .coming-index, .voices, .freedom-inner, .final-cta"
      ),
    ];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      /* Eager unlock — empty sections during fast scroll are worse than soft motion */
      { threshold: 0.01, rootMargin: "12% 0px 8% 0px" }
    );
    nodes.forEach((n) => {
      n.classList.add("motion-ready");
      if (n.getBoundingClientRect().top < innerHeight * 0.98) {
        n.classList.add("is-visible");
      } else {
        io.observe(n);
      }
    });

    const sectionalIn = document.querySelectorAll(".curated, .academy");
    if (sectionalIn.length) {
      const sectionalIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              sectionalIo.unobserve(e.target);
            }
          });
        },
        { threshold: 0.04, rootMargin: "16% 0px 10% 0px" }
      );
      sectionalIn.forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight * 0.96) {
          el.classList.add("is-in");
        } else {
          sectionalIo.observe(el);
          /* Failsafe: never leave academy/curated permanently invisible */
          window.setTimeout(() => {
            if (!el.classList.contains("is-in")) {
              el.classList.add("is-in");
              try {
                sectionalIo.unobserve(el);
              } catch (_) {
                /* already disconnected */
              }
            }
          }, 2200);
        }
      });
    }

    const closingCanvas = document.querySelector(".closing-canvas");
    if (closingCanvas) {
      const canvasIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              canvasIo.unobserve(e.target);
            }
          });
        },
        { threshold: 0.04, rootMargin: "12% 0px 8% 0px" }
      );
      if (closingCanvas.getBoundingClientRect().top < innerHeight * 0.96) {
        closingCanvas.classList.add("is-in");
      } else {
        canvasIo.observe(closingCanvas);
      }
    }
  }
})();

(() => {
  const roots = document.querySelectorAll("[data-freedom-voices]");
  if (!roots.length) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURATION = reduceMotion ? 0 : 420;

  roots.forEach((root) => {
    const quotes = [...root.querySelectorAll("[data-freedom-quote]")];
    const track = root.querySelector("[data-freedom-track]");
    const prevBtn = root.querySelector("[data-freedom-prev]");
    const nextBtn = root.querySelector("[data-freedom-next]");
    const indexEl = root.querySelector("[data-freedom-index]");
    const dots = [...root.querySelectorAll("[data-freedom-dot]")];
    if (quotes.length < 2 || !track) return;

    let index = Math.max(
      0,
      quotes.findIndex((q) => q.classList.contains("is-active"))
    );
    let animating = false;
    let resizeTimer = 0;

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function syncChrome() {
      if (indexEl) {
        const parts = indexEl.querySelectorAll("span");
        if (parts.length >= 2) {
          parts[0].textContent = pad(index + 1);
          parts[1].textContent = pad(quotes.length);
        } else {
          indexEl.textContent = `${pad(index + 1)} / ${pad(quotes.length)}`;
        }
      }
      quotes.forEach((quote, i) => {
        const on = i === index;
        quote.setAttribute("aria-hidden", String(!on));
      });
      dots.forEach((dot, i) => {
        const on = i === index;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", String(on));
        dot.tabIndex = on ? 0 : -1;
      });
    }

    function measureStage() {
      const previous = track.style.minHeight;
      let max = 0;
      /* Batch reads after writes — avoid interleaving style + layout per quote */
      const states = quotes.map((quote) => ({
        quote,
        wasHidden: quote.hasAttribute("hidden"),
        wasActive: quote.classList.contains("is-active"),
      }));
      states.forEach(({ quote }) => {
        quote.hidden = false;
        quote.classList.add("is-active");
        quote.style.position = "absolute";
        quote.style.visibility = "hidden";
        quote.style.pointerEvents = "none";
        quote.style.insetInline = "0";
        quote.style.top = "0";
      });
      states.forEach(({ quote }) => {
        max = Math.max(max, quote.offsetHeight);
      });
      states.forEach(({ quote, wasHidden, wasActive }) => {
        quote.style.position = "";
        quote.style.visibility = "";
        quote.style.pointerEvents = "";
        quote.style.insetInline = "";
        quote.style.top = "";
        if (wasHidden) quote.hidden = true;
        if (!wasActive) quote.classList.remove("is-active");
      });
      if (max > 0) {
        root.style.setProperty("--freedom-quote-h", `${Math.ceil(max)}px`);
      } else if (previous) {
        track.style.minHeight = previous;
      }
    }

    function show(nextIndex, direction) {
      if (animating) return;
      const total = quotes.length;
      const target = ((nextIndex % total) + total) % total;
      if (target === index) return;

      const current = quotes[index];
      const incoming = quotes[target];
      const dir = direction >= 0 ? 1 : -1;
      animating = true;

      if (DURATION === 0) {
        current.classList.remove("is-active");
        current.hidden = true;
        incoming.hidden = false;
        incoming.classList.add("is-active");
        index = target;
        syncChrome();
        animating = false;
        return;
      }

      incoming.hidden = false;
      incoming.classList.add("is-entering");
      incoming.style.opacity = "0";
      incoming.style.transform = `translateY(${dir * 12}px)`;

      current.classList.add("is-leaving");
      current.style.transition = `opacity ${DURATION}ms var(--ease-silk), transform ${DURATION}ms var(--ease-silk)`;
      incoming.style.transition = `opacity ${DURATION}ms var(--ease-silk), transform ${DURATION}ms var(--ease-silk)`;

      requestAnimationFrame(() => {
        current.style.opacity = "0";
        current.style.transform = `translateY(${dir * -10}px)`;
        incoming.style.opacity = "1";
        incoming.style.transform = "translateY(0)";
      });

      window.setTimeout(() => {
        current.classList.remove("is-active", "is-leaving");
        current.hidden = true;
        current.style.opacity = "";
        current.style.transform = "";
        current.style.transition = "";

        incoming.classList.remove("is-entering");
        incoming.classList.add("is-active");
        incoming.style.opacity = "";
        incoming.style.transform = "";
        incoming.style.transition = "";

        index = target;
        syncChrome();
        animating = false;
      }, DURATION);
    }

    function go(delta) {
      show(index + delta, delta);
    }

    prevBtn?.addEventListener("click", () => go(-1));
    nextBtn?.addEventListener("click", () => go(1));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const target = Number(dot.dataset.freedomDot);
        if (Number.isNaN(target)) return;
        show(target, target > index ? 1 : -1);
      });
    });

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "Home") {
        e.preventDefault();
        show(0, -1);
      } else if (e.key === "End") {
        e.preventDefault();
        show(quotes.length - 1, 1);
      }
    });

    syncChrome();
    measureStage();

    addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measureStage, 120);
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(measureStage).catch(() => {});
    }
  });
})();

(() => {
  const section = document.querySelector(".freedom[data-freedom-portrait]");
  if (!section || !section.querySelector(".freedom-portrait-img")) return;
  if (!("IntersectionObserver" in window)) {
    section.classList.add("is-portrait-in");
    return;
  }
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    section.classList.add("is-portrait-in");
    return;
  }
  if (matchMedia("(max-width: 1199.98px)").matches) {
    section.classList.add("is-portrait-in");
    return;
  }

  let done = false;
  const enter = () => {
    if (done) return;
    done = true;
    requestAnimationFrame(() => section.classList.add("is-portrait-in"));
  };

  if (section.getBoundingClientRect().top < innerHeight * 0.92) {
    enter();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        enter();
      }
    },
    { threshold: 0.18, rootMargin: "8% 0px" }
  );
  io.observe(section);
})();

(() => {
  const price = document.querySelector("#order-price");
  if (price) {
    document.querySelectorAll("input[name=currency]").forEach((x) =>
      x.addEventListener("change", () => {
        if (x.checked) price.textContent = x.value === "USD" ? "$110" : "₪335";
      })
    );
  }

  const lessons = [...document.querySelectorAll(".lesson-select")];
  if (lessons.length) {
    lessons.forEach((x) =>
      x.addEventListener("click", () => {
        lessons.forEach((y) => y.setAttribute("aria-pressed", String(y === x)));
        const num = document.querySelector("#lesson-number");
        const title = document.querySelector("#lesson-title");
        const desc = document.querySelector("#lesson-description");
        if (num) num.textContent = x.dataset.number;
        if (title) title.textContent = x.dataset.title;
        if (desc) desc.textContent = x.dataset.description;
      })
    );
  }
})();

(() => {
  const media = document.querySelector("[data-living-photo]");
  if (!media) return;

  const video = media.querySelector(".academy-flagship-video");
  if (!video) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData =
    (navigator.connection && navigator.connection.saveData) ||
    matchMedia("(prefers-reduced-data: reduce)").matches;
  const lazySrc = video.getAttribute("data-src");

  let inView = false;
  let userPaused = reduceMotion || saveData;
  let sourceArmed = false;

  if (reduceMotion || saveData) media.classList.add("is-reduced");

  video.removeAttribute("controls");
  video.controls = false;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
  video.setAttribute("loop", "");
  video.setAttribute("disablepictureinpicture", "");
  video.setAttribute("controlslist", "nodownload nofullscreen noremoteplayback");

  /* Strip eager <source> children so browsers cannot prefetch offscreen */
  if (lazySrc) {
    while (video.firstChild) video.removeChild(video.firstChild);
    video.removeAttribute("src");
  }

  function revealLive() {
    if (!video.paused) media.classList.add("is-live");
  }

  function concealLive() {
    media.classList.remove("is-live");
  }

  function armSource() {
    if (sourceArmed) return;
    sourceArmed = true;
    if (lazySrc) {
      const source = document.createElement("source");
      source.src = lazySrc;
      source.type = "video/mp4";
      video.appendChild(source);
    }
    video.preload = reduceMotion || saveData ? "metadata" : "auto";
    try {
      video.load();
    } catch (_) {
      /* keep quiet */
    }
  }

  async function tryPlay() {
    if (userPaused || !inView || document.hidden) return;
    armSource();
    video.muted = true;
    video.playsInline = true;
    video.controls = false;
    try {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }
      revealLive();
    } catch (_) {
      concealLive();
    }
  }

  function pauseSoftly() {
    if (!video.paused) {
      video.pause();
    }
    concealLive();
  }

  video.addEventListener("playing", revealLive);
  video.addEventListener("pause", () => {
    /* retain last frame; no overlay */
  });
  video.addEventListener("error", () => {
    concealLive();
    userPaused = true;
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting && entry.intersectionRatio >= 0.28;
          if (inView) {
            armSource();
            tryPlay();
          } else {
            pauseSoftly();
          }
        });
      },
      { threshold: [0, 0.28, 0.55], rootMargin: "8% 0px" }
    );
    io.observe(media);
  } else {
    inView = true;
    armSource();
    tryPlay();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseSoftly();
    } else {
      tryPlay();
    }
  });
})();

(() => {
  const hero = document.querySelector("[data-cinematic-hero]");
  if (!hero) return;

  const video = hero.querySelector(".hero-cinema-video");
  const still = hero.querySelector(".hero-still");
  const stage = hero.querySelector(".hero-stage");
  if (!video) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData =
    (navigator.connection && navigator.connection.saveData) ||
    matchMedia("(prefers-reduced-data: reduce)").matches;
  const mobileMq = matchMedia("(max-width: 760px)");
  const src = video.getAttribute("data-src");
  const poster = video.getAttribute("data-poster");

  let armed = false;
  let inView = true;
  let entered = false;
  let stillArmed = false;
  let wasMobile = mobileMq.matches;
  let mqTimer = 0;

  function markEntered() {
    if (entered) return;
    entered = true;
    hero.classList.add("is-cinema-entered");
  }

  function paintPoster() {
    /* Mobile cinema only — never layer the mobile poster under the desktop still */
    if (!stage || !poster || !mobileMq.matches) return;
    stage.style.backgroundImage = 'url("' + poster + '")';
  }

  function clearPoster() {
    if (!stage) return;
    stage.style.backgroundImage = "";
    stage.style.removeProperty("background-image");
  }

  function armStill() {
    if (!still || stillArmed) return;
    const desktopSrc = still.getAttribute("data-src") || still.getAttribute("src");
    if (!desktopSrc || desktopSrc.startsWith("data:")) return;
    /* Mobile cinema path must never download the desktop hero still */
    if (mobileMq.matches) {
      if (still.hasAttribute("src") && !still.getAttribute("src").startsWith("data:")) {
        still.removeAttribute("src");
        still.removeAttribute("fetchpriority");
      }
      return;
    }
    stillArmed = true;
    clearPoster();
    if (still.getAttribute("src") !== desktopSrc) {
      still.setAttribute("src", desktopSrc);
    }
    still.setAttribute("fetchpriority", "high");
  }

  function disarm() {
    /* Only tear down when leaving the mobile cinema path — never on scroll */
    hero.classList.remove("is-cinema-live", "is-cinema-ready");
    if (!video.paused) video.pause();
    video.removeAttribute("src");
    video.removeAttribute("poster");
    while (video.firstChild) video.removeChild(video.firstChild);
    try {
      video.load();
    } catch (_) {
      /* ignore */
    }
    armed = false;
    clearPoster();
  }

  function arm() {
    if (armed || !src || reduceMotion || saveData) return;
    armed = true;
    paintPoster();
    if (poster) video.setAttribute("poster", poster);
    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";
    video.appendChild(source);
    video.preload = "metadata";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    try {
      video.load();
    } catch (_) {
      /* keep poster */
    }
  }

  async function tryPlay() {
    if (!mobileMq.matches || reduceMotion || saveData || !inView || document.hidden) return;
    arm();
    if (!armed) return;
    try {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }
      hero.classList.add("is-cinema-ready", "is-cinema-live");
      markEntered();
    } catch (_) {
      hero.classList.add("is-cinema-ready");
      markEntered();
    }
  }

  function pauseSoftly() {
    /* Keep last decoded frame — do not remount or clear ready state */
    if (!video.paused) video.pause();
    hero.classList.remove("is-cinema-live");
  }

  function syncViewport() {
    if (!mobileMq.matches) {
      /* Desktop: official still only — no video, no mobile poster underlay */
      if (wasMobile || armed) disarm();
      wasMobile = false;
      stillArmed = false;
      armStill();
      markEntered();
      return;
    }
    wasMobile = true;
    /* Drop any desktop still that may have been armed before a resize into mobile */
    if (still && still.hasAttribute("src") && !still.getAttribute("src").startsWith("data:")) {
      still.removeAttribute("src");
      still.removeAttribute("fetchpriority");
      stillArmed = false;
    }
    paintPoster();
    if (reduceMotion || saveData) {
      if (poster) video.setAttribute("poster", poster);
      hero.classList.add("is-cinema-ready");
      markEntered();
      return;
    }
    tryPlay();
  }

  video.addEventListener("playing", () => {
    hero.classList.add("is-cinema-ready", "is-cinema-live");
    markEntered();
  });

  video.addEventListener("loadeddata", () => {
    hero.classList.add("is-cinema-ready");
  });

  video.addEventListener("error", () => {
    hero.classList.add("is-cinema-ready");
    markEntered();
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
          if (inView) {
            tryPlay();
          } else {
            pauseSoftly();
          }
        });
      },
      { threshold: [0, 0.15, 0.4], rootMargin: "12% 0px" }
    );
    io.observe(hero);
  } else if (!reduceMotion) {
    inView = true;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseSoftly();
    } else {
      tryPlay();
    }
  });

  const onViewportChange = () => {
    /* Debounce MQ flips (orientation / split-view) to avoid remount thrash */
    clearTimeout(mqTimer);
    mqTimer = window.setTimeout(syncViewport, 180);
  };
  if (typeof mobileMq.addEventListener === "function") {
    mobileMq.addEventListener("change", onViewportChange);
  } else if (typeof mobileMq.addListener === "function") {
    mobileMq.addListener(onViewportChange);
  }

  /* Mobile: paint cinema poster first. Desktop: official still only. */
  if (mobileMq.matches) paintPoster();
  requestAnimationFrame(() => {
    if (!mobileMq.matches || reduceMotion || saveData) {
      markEntered();
    } else {
      window.setTimeout(markEntered, 480);
    }
    syncViewport();
  });

  /* ---------- Course page: mobile enroll bar visibility ---------- */
  if (document.body.classList.contains("page-online-course")) {
    const bar = document.querySelector("[data-course-bar]");
    const enroll = document.querySelector("[data-course-enroll]");
    if (bar && enroll && "IntersectionObserver" in window) {
      const syncBar = (hidden) => {
        bar.classList.toggle("is-hidden", hidden);
        bar.setAttribute("aria-hidden", hidden ? "true" : "false");
      };
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          syncBar(Boolean(entry && entry.isIntersecting));
        },
        { threshold: 0.28, rootMargin: "0px 0px -8% 0px" }
      );
      io.observe(enroll);
      if (drawer) {
        drawer.addEventListener("toggle", () => {
          if (drawer.open) syncBar(true);
        });
      }
    }
  }

})();
