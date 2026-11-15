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
  await page.screenshot({ path: path.join(outputDir, '01_dashboard_full.png'), fullPage: true });
  await page.screenshot({ path: path.join(artifactDir, '01_dashboard_full.png'), fullPage: true });

  // 1b. Dashboard Range chart tab
  console.log('Capturing Dashboard Range tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const rangeBtn = buttons.find(b => b.innerText.includes('Диапазоны'));
    if (rangeBtn) rangeBtn.click();
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
  await page.screenshot({ path: path.join(outputDir, '01_dashboard_dark_full.png'), fullPage: true });
  await page.screenshot({ path: path.join(artifactDir, '01_dashboard_dark_full.png'), fullPage: true });

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
  await page.screenshot({ path: path.join(outputDir, '02_analyses_full.png'), fullPage: true });
  await page.screenshot({ path: path.join(artifactDir, '02_analyses_full.png'), fullPage: true });

  // 3. Finances & Doctors
  console.log('Capturing Finances & Doctors...');
  await page.goto('http://localhost:5173/finances', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '03_finances.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '03_finances.png'), fullPage: false });
  await page.screenshot({ path: path.join(outputDir, '03_finances_full.png'), fullPage: true });
  await page.screenshot({ path: path.join(artifactDir, '03_finances_full.png'), fullPage: true });

  // 4. Settings & Excel (.xlsx) Sync
  console.log('Capturing Settings & Excel Sync...');
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '04_settings.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '04_settings.png'), fullPage: false });
  await page.screenshot({ path: path.join(outputDir, '04_settings_full.png'), fullPage: true });
  await page.screenshot({ path: path.join(artifactDir, '04_settings_full.png'), fullPage: true });

  // 4b. Settings in Dark Mode
  console.log('Capturing Settings (Dark Mode)...');
  await page.evaluate(() => {
    const themeBtn = document.querySelector('button[title*="тема"]');
    if (themeBtn) themeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outputDir, '04_settings_dark.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '04_settings_dark.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
