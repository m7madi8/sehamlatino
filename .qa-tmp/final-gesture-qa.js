const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const outDir = __dirname;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  async function measure() {
    return page.evaluate(() => {
      const cta = document.querySelector(".final-cta");
      const cs = getComputedStyle(cta, "::before");
      const h2 = cta.querySelector("h2").getBoundingClientRect();
      const buy = cta.querySelector(".cta-buy").getBoundingClientRect();
      const explore = cta.querySelector(".cta-explore").getBoundingClientRect();
      const beforeBottom = cta.getBoundingClientRect().top + parseFloat(cs.height);
      return {
        vw: innerWidth,
        dir: document.documentElement.dir,
        asset: cs.backgroundImage.includes("mobile")
          ? "mobile"
          : cs.backgroundImage.includes("cta-final-gesture")
            ? "desktop"
            : "MISSING",
        beforeW: Math.round(parseFloat(cs.width)),
        beforeH: Math.round(parseFloat(cs.height)),
        padTop: Math.round(parseFloat(getComputedStyle(cta).paddingTop)),
        clearH2: beforeBottom <= h2.top - 2,
        clearBuy: beforeBottom <= buy.top - 2,
        clearExplore: beforeBottom <= explore.top - 2,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        right: cs.right,
        transform: cs.transform,
        h2Color: getComputedStyle(cta.querySelector("h2")).color,
        buyBg: getComputedStyle(cta.querySelector(".cta-buy")).backgroundColor,
        oldAfter: getComputedStyle(document.querySelector(".closing-silk"), "::after").content,
      };
    });
  }

  async function shot(label) {
    await page.locator(".final-cta").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.locator(".final-cta").screenshot({
      path: path.join(outDir, `cta-${label}.png`),
    });
    const m = await measure();
    console.log(label, JSON.stringify(m));
    return m;
  }

  await page.goto("http://127.0.0.1:8765/index.html", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".final-cta");

  const arSizes = [320, 360, 375, 390, 430, 600, 768, 1024, 1199, 1200, 1440, 1920, 2560];
  for (const w of arSizes) {
    const h = w < 600 ? 844 : w < 1200 ? 1024 : 900;
    await page.setViewportSize({ width: w, height: h });
    await shot(`ar-${w}`);
  }

  await page.goto("http://127.0.0.1:8765/en/index.html", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".final-cta");

  for (const w of [390, 768, 1440, 1920]) {
    const h = w < 600 ? 844 : w < 1200 ? 1024 : 900;
    await page.setViewportSize({ width: w, height: h });
    await shot(`en-${w}`);
  }

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
