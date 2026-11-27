import { chromium } from "playwright-core";
const browser = await chromium.launch({
  executablePath: "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:5500/seham-studio/index.html?v=academy-sleeve", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(1000);
await page.evaluate(() => {
  document.querySelector(".academy")?.classList.add("is-in");
  document.getElementById("courses").scrollIntoView({ block: "start" });
});
await page.waitForTimeout(500);
const box = await page.locator(".academy-flagship").boundingBox();
await page.screenshot({
  path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/seham-studio/img/_qa-flagship.png",
  clip: { x: box.x - 8, y: Math.max(0, box.y - 160), width: box.width + 16, height: Math.min(box.height + 200, 820) },
});
await page.locator(".academy-upcoming").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const ubox = await page.locator(".academy-upcoming").boundingBox();
await page.screenshot({
  path: "C:/Users/eslam/Downloads/SEHAM-LATINO-FRONTEND/seham-studio/img/_qa-soon2.png",
  clip: { x: ubox.x, y: Math.max(0, ubox.y - 20), width: ubox.width, height: Math.min(ubox.height + 40, 420) },
});
await browser.close();
console.log("ok");
