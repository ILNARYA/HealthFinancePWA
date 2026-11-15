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
  // Target width 375px (standard mobile width where user observed clipping)
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  // 1. Dashboard
  console.log('Capturing Dashboard...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.evaluate(() => {
    localStorage.setItem('app-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '01_dashboard.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '01_dashboard.png'), fullPage: false });

  // 1b. Family Cabinet Modal
  console.log('Capturing Family Cabinet Modal...');
  await page.evaluate(() => {
    const familyBtn = document.querySelector('button[title*="Семейный"]');
    if (familyBtn) familyBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outputDir, '05_family_modal.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '05_family_modal.png'), fullPage: false });

  // Close family modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.fixed button');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 300));

  // 2. Analyses & AI Scanner (Check bounds & margins)
  console.log('Capturing Analyses & AI Breakdown...');
  await page.goto('http://localhost:5173/analyses', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '02_analyses.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '02_analyses.png'), fullPage: false });

  // 3. Finances & Doctors (Check bounds of purple card & donut chart)
  console.log('Capturing Finances & Doctors...');
  await page.goto('http://localhost:5173/finances', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '03_finances.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '03_finances.png'), fullPage: false });

  // 3b. Receipt Scanner OCR Modal
  console.log('Capturing Receipt Scanner OCR Modal...');
  await page.evaluate(() => {
    const camBtn = document.querySelector('button[title*="Сфотографировать чек"]');
    if (camBtn) camBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  // Click first sample "Аптека Ригла (3 050 ₽)"
  await page.evaluate(() => {
    const sampleBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('Ригла'));
    if (sampleBtns.length > 0) sampleBtns[0].click();
  });
  // Wait for OCR simulation to finish (approx 1.8s)
  await new Promise((r) => setTimeout(r, 2200));
  await page.screenshot({ path: path.join(outputDir, '07_receipt_scanner.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '07_receipt_scanner.png'), fullPage: false });

  // Close scanner modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.fixed button');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 300));

  // 4. Settings (Family Cabinet, Security Vault & Google Account)
  console.log('Capturing Settings & Security...');
  await page.goto('http://localhost:5173/settings', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '04_settings.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '04_settings.png'), fullPage: false });

  // 4b. 2FA Google Authenticator Modal
  console.log('Capturing 2FA Modal...');
  await page.evaluate(() => {
    const twoFaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Подключить') && b.closest('.space-y-3'));
    if (twoFaBtn) twoFaBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outputDir, '08_2fa_modal.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '08_2fa_modal.png'), fullPage: false });

  // Close 2FA modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.fixed button');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 300));

  // 5. Candlestick Range Chart on Dashboard
  console.log('Capturing Dashboard Candlestick Ranges...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600));
  // Switch to "Диапазоны" tab if present
  await page.evaluate(() => {
    const rangeTabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Диапазоны') || b.textContent?.includes('Свечи'));
    if (rangeTabBtn) rangeTabBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outputDir, '09_dashboard_candlestick.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '09_dashboard_candlestick.png'), fullPage: false });

  // 6. PIN Lock Screen Modal (Trigger lockApp)
  console.log('Capturing Secure PIN Lock Screen...');
  await page.evaluate(() => {
    const lockBtn = document.querySelector('button[title*="Заблокировать"]');
    if (lockBtn) lockBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outputDir, '06_pin_lock.png'), fullPage: false });
  await page.screenshot({ path: path.join(artifactDir, '06_pin_lock.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
