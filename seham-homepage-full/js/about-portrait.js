/* About Seham — sculptural entrance only. Scoped to .about-portrait. */
(() => {
  const section = document.querySelector(".about-portrait");
  if (!section) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  section.classList.add("ap-js");

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        section.classList.add("ap-in");
        setTimeout(() => section.classList.add("ap-done"), 1600);
      })
    );
  };

  const top = section.getBoundingClientRect().top;
  if (top < innerHeight * 0.96) {
    reveal();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        reveal();
      }
    },
    { threshold: 0.08, rootMargin: "18% 0px 10% 0px" }
  );
  io.observe(section);

  window.setTimeout(() => {
    if (!revealed) {
      try {
        io.disconnect();
      } catch (_) {
        /* ignore */
      }
      reveal();
    }
  }, 2400);
})();
