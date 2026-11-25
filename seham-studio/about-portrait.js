/* About Seham — scoped entrance choreography. Touches only .about-portrait. */
(() => {
  const section = document.querySelector(".about-portrait");
  if (!section) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return; // content stays fully visible

  section.classList.add("ap-js");

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    // two frames so the hidden state is painted before the transition starts
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        section.classList.add("ap-in");
        // after the entrance, give the CTA instant hover/press feedback again
        setTimeout(() => section.classList.add("ap-done"), 1800);
      })
    );
  };

  /* Seed immediately if already near viewport — avoid invisible section on fast scroll */
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

  /* Failsafe — never leave portrait content permanently opacity:0 */
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
