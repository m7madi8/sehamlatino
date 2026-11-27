import { chromium } from "playwright-core";
const browser = await chromium.launch({
  executablePath: "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:5500/seham-studio/index.html?v=signature-silk", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  document.querySelectorAll(".js-motion .reveal-line, .freedom, .about-portrait, .closing-canvas, .academy").forEach(el => el.classList.add("is-in","ap-in","ap-done","is-portrait-in"));
  const f = document.querySelector(".freedom");
  if (f) f.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(600);
const checks = await page.evaluate(() => {
  const silk = (name) => {
    const url = getComputedStyle(document.documentElement).getPropertyValue("unused");
    return true;
  };
  const bridge = document.querySelector(".editorial-silk--bridge");
  const crownBg = getComputedStyle(document.querySelector(".freedom[data-freedom-portrait]"), "::before").backgroundImage;
  const bridgeBg = bridge ? getComputedStyle(bridge, "::before").backgroundImage : null;
  const exitBg = getComputedStyle(document.querySelector(".closing-silk"), "::after").backgroundImage;
  const photoClip = getComputedStyle(document.querySelector(".ap-photo")).clipPath;
  const foundation = getComputedStyle(document.querySelector(".ap-foundation")).display;
  const outline = getComputedStyle(document.querySelector(".ap-reference-outline")).display;
  const titleColor = getComputedStyle(document.querySelector(".freedom-title-lead")).color;
  const apTitle = getComputedStyle(document.querySelector(".ap-title")).color;
  const ctaH2 = getComputedStyle(document.querySelector(".final-cta h2")).color;
  const storyBg = getComputedStyle(document.querySelector(".editorial-story")).backgroundColor;
  return { crownBg, bridgeBg, exitBg, photoClip, foundation, outline, titleColor, apTitle, ctaH2, storyBg, hasStory: !!document.querySelector(".editorial-story"), brokenImgs: [...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src) };
});
const box = await page.locator(".editorial-story").boundingBox();
await page.screenshot({
  path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/.qa-tmp/silk-story-1440.png",
  clip: { x: 0, y: Math.max(0, box.y), width: 1440, height: Math.min(box.height, 2400) },
  fullPage: false,
});
// freerom focus
await page.evaluate(() => document.querySelector(".freedom").scrollIntoView({block:"start"}));
await page.waitForTimeout(300);
await page.screenshot({ path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/.qa-tmp/silk-freedom.png" });
await page.evaluate(() => document.querySelector(".about-portrait").scrollIntoView({block:"center"}));
await page.waitForTimeout(300);
await page.screenshot({ path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/.qa-tmp/silk-about.png" });
await page.evaluate(() => document.querySelector(".final-cta").scrollIntoView({block:"center"}));
await page.waitForTimeout(300);
await page.screenshot({ path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/.qa-tmp/silk-cta.png" });
await browser.close();
console.log(JSON.stringify(checks, null, 2));
