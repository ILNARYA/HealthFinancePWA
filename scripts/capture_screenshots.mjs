import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('./public/screenshots');
const artifactDir = 'C:\\Users\\Yamaev\\.gemini\\antigravity\\brain\\bef910c9-2cd6-4c29-8dda-0cc5caa1a429';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  const routes = [
    { url: 'http://localhost:5173/', name: '01_dashboard.png', title: 'Дашборд (экран)', fullPage: false },
    { url: 'http://localhost:5173/', name: '01_dashboard_full.png', title: 'Дашборд (полный скролл)', fullPage: true },
    { url: 'http://localhost:5173/analyses', name: '02_analyses.png', title: 'Анализы и ИИ-разбор', fullPage: false },
    { url: 'http://localhost:5173/analyses', name: '02_analyses_full.png', title: 'Анализы (полный скролл)', fullPage: true },
    { url: 'http://localhost:5173/finances', name: '03_finances.png', title: 'Финансы и врачи', fullPage: false },
    { url: 'http://localhost:5173/finances', name: '03_finances_full.png', title: 'Финансы (полный скролл)', fullPage: true },
    { url: 'http://localhost:5173/settings', name: '04_settings.png', title: 'Настройки и синхронизация', fullPage: false },
    { url: 'http://localhost:5173/settings', name: '04_settings_full.png', title: 'Настройки (полный скролл)', fullPage: true }
  ];

  for (const r of routes) {
    console.log(`Capturing ${r.title}...`);
    await page.goto(r.url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(res => setTimeout(res, 800)); // wait for charts
    const localPath = path.join(outputDir, r.name);
    const artPath = path.join(artifactDir, r.name);
    await page.screenshot({ path: localPath, fullPage: r.fullPage });
    await page.screenshot({ path: artPath, fullPage: r.fullPage });
    console.log(`Saved ${r.name}`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
