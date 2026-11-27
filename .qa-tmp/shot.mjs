import { chromium } from "playwright-core";
const browser = await chromium.launch({
  executablePath: "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:5500/seham-studio/index.html?v=academy-quiet-luxury", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(1400);
await page.evaluate(() => {
  document.querySelector(".academy")?.classList.add("is-in");
  document.getElementById("courses").scrollIntoView({ block: "start" });
});
await page.waitForTimeout(700);
const colors = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { color: cs.color, bg: cs.backgroundColor, border: cs.borderTopColor, fs: cs.fontSize };
  };
  return {
    display: pick(".academy-display"),
    status: pick(".academy-status"),
    title: pick(".academy-course-title"),
    level: pick(".academy-level"),
    desc: pick(".academy-desc"),
    dt: pick(".academy-specs dt"),
    dd: pick(".academy-specs dd"),
    priceStrong: pick(".academy-price strong"),
    priceSpan: pick(".academy-price > span:not(.academy-price-sep)"),
    solid: pick(".academy-btn--solid"),
    ghost: pick(".academy-btn--ghost"),
    upHead: pick(".academy-upcoming-heading"),
    soonTitle: pick(".academy-soon-title"),
    soonLevel: pick(".academy-soon-level"),
    soonBadge: pick(".academy-soon-badge"),
    hasToggle: !!document.querySelector(".academy-living-toggle"),
    hasControls: document.querySelector(".academy-flagship-video")?.controls,
    clip: getComputedStyle(document.querySelector(".academy-flagship-media")).clipPath,
    frameBorder: getComputedStyle(document.querySelector(".academy-flagship-frame")).borderTopColor,
    ghostBorder: getComputedStyle(document.querySelector(".academy-btn--ghost")).borderTopColor,
  };
});
const box = await page.locator("#courses").boundingBox();
await page.screenshot({
  path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/.qa-tmp/academy-ar.png",
  clip: { x: box.x, y: Math.max(0, box.y), width: box.width, height: Math.min(box.height, 860) },
});
await page.locator(".academy-upcoming").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const ubox = await page.locator(".academy-upcoming").boundingBox();
await page.screenshot({
  path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/.qa-tmp/academy-soon.png",
  clip: { x: ubox.x, y: Math.max(0, ubox.y - 10), width: ubox.width, height: Math.min(ubox.height + 20, 460) },
});
await page.goto("http://127.0.0.1:5500/seham-studio/en/index.html?v=academy-quiet-luxury", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  document.querySelector(".academy")?.classList.add("is-in");
  document.getElementById("courses").scrollIntoView({ block: "start" });
});
await page.waitForTimeout(600);
await page.screenshot({ path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/.qa-tmp/academy-en.png" });
await browser.close();
console.log(JSON.stringify(colors, null, 2));
