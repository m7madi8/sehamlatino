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
        setTimeout(() => section.classList.add("ap-done"), 2400);
      })
    );
  };

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        reveal();
      }
    },
    { threshold: 0.28, rootMargin: "0px 0px -4% 0px" }
  );
  io.observe(section);

})();
