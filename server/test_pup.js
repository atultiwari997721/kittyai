const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    console.log('Browser launched successfully!');
    await browser.close();
    console.log('Browser closed.');
  } catch (err) {
    console.error('Failed to launch browser:', err);
  }
})();
