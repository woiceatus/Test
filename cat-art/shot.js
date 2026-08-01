const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

(async () => {
  const out = process.argv[2] || "/opt/cursor/artifacts/screenshots/cat-latest.png";
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 1400, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:8765/", { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForFunction(() => document.getElementById("c")?.dataset?.ready === "1", {
    timeout: 120000,
  });
  // Capture canvas only
  const b64 = await page.$eval("#c", (c) => c.toDataURL("image/png").split(",")[1]);
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  // Full page too
  await page.screenshot({ path: out.replace(".png", "-page.png"), fullPage: true });
  console.log("Wrote", out, fs.statSync(out).size);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
