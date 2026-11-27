const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("http://127.0.0.1:8765/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  await page.screenshot({
    path: path.join(__dirname, "preloader-mid.png"),
    fullPage: false,
  });
  await page.waitForFunction(
    () => !document.documentElement.classList.contains("is-preloading"),
    { timeout: 10000 }
  );
  await page.screenshot({
    path: path.join(__dirname, "preloader-after.png"),
    fullPage: false,
  });
  console.log("shots-ok");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
