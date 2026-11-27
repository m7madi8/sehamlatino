/**
 * Run in DevTools console on homepage (after load) for frame timing during scroll.
 * Example: paste after navigation; reports median/p95 dt from requestAnimationFrame sampling.
 */
(() => {
  const samples = [];
  let running = true;
  let last = performance.now();
  const max = 480;
  const tick = (t) => {
    if (!running) return;
    samples.push(t - last);
    last = t;
    if (samples.length < max) requestAnimationFrame(tick);
    else finish();
  };
  const finish = () => {
    running = false;
    const sorted = [...samples].sort((a, b) => a - b);
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    const med = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const worst = sorted[sorted.length - 1];
    console.table({
      frames: samples.length,
      avgMs: +avg.toFixed(2),
      medianMs: +med.toFixed(2),
      p95Ms: +p95.toFixed(2),
      worstMs: +worst.toFixed(2),
      over32ms: samples.filter((x) => x > 32).length,
    });
    window.__sehamFrameBench = { avg, med, p95, worst, samples };
  };
  console.info("[seham] scroll now — sampling", max, "frames");
  requestAnimationFrame(tick);
  window.__sehamStopFrameBench = () => {
    running = false;
    finish();
  };
})();