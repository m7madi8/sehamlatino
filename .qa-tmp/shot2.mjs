import { chromium } from "playwright-core";
const browser = await chromium.launch({
  executablePath: "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:5500/seham-studio/index.html?v=academy-sleeve2", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  document.querySelector(".academy")?.classList.add("is-in");
  document.getElementById("courses").scrollIntoView({ block: "start" });
});
await page.waitForTimeout(600);
const box = await page.locator("#courses").boundingBox();
await page.screenshot({
  path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/seham-studio/img/_qa-academy-clip.png",
  clip: { x: box.x, y: Math.max(0, box.y), width: box.width, height: Math.min(box.height, 780) },
});
await page.goto("http://127.0.0.1:5500/seham-studio/en/index.html?v=academy-sleeve2", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  document.querySelector(".academy")?.classList.add("is-in");
  document.getElementById("courses").scrollIntoView({ block: "start" });
});
await page.waitForTimeout(600);
await page.screenshot({ path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/seham-studio/img/_qa-academy-en.png" });
await browser.close();
console.log("ok");
