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

  // 1. Dashboard (Light Theme)
  console.log('Capturing Dashboard (Light)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.evaluate(() => {
    localStorage.setItem('app-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '01_dashboard.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '01_dashboard.png'), fullPage: false });

  // 1b. Dashboard Range chart tab (Test Range Tooltip & Biomarker Switcher)
  console.log('Capturing Dashboard Range tab with selected bar & biomarker...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const rangeBtn = buttons.find(b => b.innerText.includes('Диапазоны'));
    if (rangeBtn) rangeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Select eGFR (СКФ) chip
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const egfrBtn = buttons.find(b => b.innerText.includes('СКФ'));
    if (egfrBtn) egfrBtn.click();
  });
  await new Promise((r) => setTimeout(r, 300));

  // Click on a candlestick bar (e.g., 2024 or 2023) to test tooltip placement
  await page.evaluate(() => {
    const yearElements = Array.from(document.querySelectorAll('span')).filter(s => s.innerText === '2024');
    if (yearElements.length > 0) {
      const parent = yearElements[0].closest('.cursor-pointer');
      if (parent) parent.click();
    }
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outputDir, '01_dashboard_range.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '01_dashboard_range.png'), fullPage: false });

  // 1c. Dashboard (Dark Theme matching healthcare_2.png)
  console.log('Capturing Dashboard (Dark Theme)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const radarBtn = buttons.find(b => b.innerText.includes('Паук'));
    if (radarBtn) radarBtn.click();
    const themeBtn = document.querySelector('button[title*="тему"]');
    if (themeBtn) themeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '01_dashboard_dark.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '01_dashboard_dark.png'), fullPage: false });

  // Switch back to light theme for default 2, 3, 4
  await page.evaluate(() => {
    const themeBtn = document.querySelector('button[title*="тему"]');
    if (themeBtn) themeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // 2. Analyses & AI Scanner
  console.log('Capturing Analyses & AI Breakdown...');
  await page.goto('http://localhost:5173/analyses', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '02_analyses.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '02_analyses.png'), fullPage: false });

  // 3. Finances & Doctors (Default state)
  console.log('Capturing Finances & Doctors (Default)...');
  await page.goto('http://localhost:5173/finances', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '03_finances.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '03_finances.png'), fullPage: false });

  // 3b. Finances & Doctors (Active Donut Slice / Pop-Out state)
  console.log('Capturing Finances with Active Donut Sector (Анализы)...');
  await page.evaluate(() => {
    // Click on the 'Анализы' category chip below the donut
    const categoryCards = Array.from(document.querySelectorAll('div')).filter(d => d.innerText.includes('Анализы') && d.classList.contains('cursor-pointer'));
    if (categoryCards.length > 0) {
      categoryCards[0].click();
    }
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outputDir, '03_finances_selected.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '03_finances_selected.png'), fullPage: false });

  // 4. Settings & Excel (.xlsx) Sync
  console.log('Capturing Settings & Excel Sync...');
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '04_settings.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '04_settings.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
