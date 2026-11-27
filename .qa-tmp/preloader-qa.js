const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const t0 = Date.now();
  await page.goto("http://127.0.0.1:8765/index.html", { waitUntil: "domcontentloaded" });

  const early = await page.evaluate(() => ({
    hasIntro: !!document.getElementById("intro"),
    preloading: document.documentElement.classList.contains("is-preloading"),
    gsap: typeof gsap !== "undefined",
  }));
  console.log("early", JSON.stringify(early));

  await page.waitForFunction(
    () => !document.documentElement.classList.contains("is-preloading"),
    { timeout: 12000 }
  );
  const elapsed = Date.now() - t0;
  const after = await page.evaluate(() => ({
    preloading: document.documentElement.classList.contains("is-preloading"),
    introHidden: document.getElementById("intro")?.hidden === true,
    overflow: getComputedStyle(document.documentElement).overflow,
  }));
  console.log("done", JSON.stringify({ elapsedMs: elapsed, ...after }));

  await page.goto("http://127.0.0.1:8765/en/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => !document.documentElement.classList.contains("is-preloading"),
    { timeout: 12000 }
  );
  console.log("en-ok");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:8765/index.html", { waitUntil: "domcontentloaded" });
  const t1 = Date.now();
  await page.waitForFunction(
    () => !document.documentElement.classList.contains("is-preloading"),
    { timeout: 8000 }
  );
  console.log("reducedMs", Date.now() - t1);

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
