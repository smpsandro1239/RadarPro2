/**
 * Capturas da landing (Fase A) para revisao visual.
 *
 *   npm run capture:design          # usa http://localhost:3000
 *   CAPTURE_URL=... npm run capture:design
 *
 * Saida: docs/design/capturas/*.png (desktop 1360 e movel 390).
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.CAPTURE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "docs", "design", "capturas");

const VIEWPORTS = [
  { name: "desktop-1360", width: 1360, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

async function main(): Promise<number> {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60000 });
    const reject = page.getByRole("button", { name: /rejeitar/i });
    if ((await reject.count()) > 0) {
      await reject.first().click();
    }
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT_DIR, `landing-${viewport.name}.png`) });
    await page.screenshot({ path: path.join(OUT_DIR, `landing-${viewport.name}-completa.png`), fullPage: true });

    const nodes = await page.evaluate(() => document.querySelectorAll("*").length);
    console.log(`[${viewport.name}] ${nodes} nos DOM; erros de consola: ${errors.length}`);
    for (const error of errors.slice(0, 5)) console.log(`  - ${error}`);

    await context.close();
  }

  await browser.close();
  console.log(`Capturas gravadas em ${OUT_DIR}`);
  return 0;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(`[ERRO] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
