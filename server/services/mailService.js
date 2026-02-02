const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');

puppeteer.use(StealthPlugin());

class MailService {
    constructor() {
        this.sessionPath = path.join(__dirname, '..', 'gmail_session');
        if (!fs.existsSync(this.sessionPath)) {
            fs.mkdirSync(this.sessionPath, { recursive: true });
        }
        this.browser = null;
    }

    async getBrowser() {
        if (this.browser) {
            try {
                // Check if browser is still connected
                if (this.browser.isConnected()) return this.browser;
            } catch (e) {
                this.browser = null;
            }
        }

        console.log('Launching new browser instance...');
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-notifications',
                '--window-size=1200,900',
                `--user-data-dir=${this.sessionPath}`
            ],
            defaultViewport: null
        });

        // Handle disconnect/close
        this.browser.on('disconnected', () => {
            console.log('Browser disconnected.');
            this.browser = null;
        });

        return this.browser;
    }

    async openSession(senderEmail) {
        console.log(`Opening Gmail session for ${senderEmail || 'default account'}...`);
        
        // Close existing browser to potential lock issues if restarting session
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (e) {}
            this.browser = null;
        }

        const browser = await this.getBrowser();
        const pages = await browser.pages();
        const page = pages[0] || await browser.newPage();

        try {
            await page.goto('https://mail.google.com/', { waitUntil: 'networkidle2' });
            
            // Wait for user to log in or for the page to be ready
            console.log('Waiting for login indicators...');
            await page.waitForFunction(() => {
                return !!document.querySelector('div[role="button"][gh="cm"]') || 
                       !!document.querySelector('.T-I-KE') ||
                       !!document.querySelector('div[aria-label="Compose"]') ||
                       !!document.querySelector('div[aria-label*="Compose"]');
            }, { timeout: 300000 }); // 5 minutes to login

            console.log('Gmail session verified.');
            // KEEP BROWSER OPEN
            return { success: true };
        } catch (error) {
            console.error('Session verification failed:', error);
            // Do not close browser on error, let user see what happened? 
            // Or close it to reset? Let's keep it open for debugging if possible, 
            // but if we throw, backend might think it failed.
            throw error;
        }
    }

    async sendEmailBatch(recipients, subject, message, senderEmail) {
        console.log(`Starting Broadcast for ${recipients.length} recipients...`);
        
        let browser;
        try {
             browser = await this.getBrowser();
        } catch (err) {
            console.error('Failed to get browser:', err);
            throw new Error('Could not launch browser. Is it already open?');
        }

        try {
            // Get all pages, look for Gmail
            const pages = await browser.pages();
            let page = pages.find(p => p.url().includes('mail.google.com'));

            if (!page) {
                console.log('Gmail tab not found, opening new one...');
                page = await browser.newPage();
                await page.goto('https://mail.google.com/', { waitUntil: 'networkidle2' });
            } else {
                console.log('Using existing Gmail tab.');
                await page.bringToFront();
            }

            console.log('Verifying login state...');
            await page.waitForFunction(() => {
                return !!document.querySelector('div[role="button"][gh="cm"]') || 
                       !!document.querySelector('.T-I-KE') ||
                       !!document.querySelector('div[aria-label="Compose"]') ||
                       !!document.querySelector('div[aria-label*="Compose"]');
            }, { timeout: 60000 }); 

            let sentCount = 0;
            const batchSize = 5;

            for (let i = 0; i < recipients.length; i++) {
                const to = recipients[i].trim();
                if (!to) continue;

                try {
                    console.log(`Processing ${to} (${i + 1}/${recipients.length})...`);

                    // 1. Click Compose
                    await page.waitForSelector('div[role="button"][gh="cm"], .T-I-KE, div[aria-label="Compose"], div[aria-label*="Compose"]', { visible: true });
                    await page.click('div[role="button"][gh="cm"], .T-I-KE, div[aria-label="Compose"], div[aria-label*="Compose"]');

                    // 2. Wait for Compose window
                    const toSelector = 'textarea[name="to"], input[role="combobox"], .vO, [aria-label="To"]';
                    await page.waitForSelector(toSelector, { visible: true, timeout: 15000 });
                    
                    // 3. Enter Recipient
                    await page.click(toSelector);
                    await page.type(toSelector, to);
                    await page.keyboard.press('Tab');
                    await new Promise(r => setTimeout(r, 800));

                    // 4. Enter Subject
                    const subSelector = 'input[name="subjectbox"], .aoT, [aria-label="Subject"]';
                    await page.waitForSelector(subSelector, { visible: true });
                    await page.click(subSelector);
                    await page.type(subSelector, subject);
                    await page.keyboard.press('Tab');
                    await new Promise(r => setTimeout(r, 800));

                    // 5. Enter Message
                    await page.keyboard.type(message, { delay: 5 }); 
                    await new Promise(r => setTimeout(r, 1000));

                    // 6. Click Send
                    await page.keyboard.down('Control');
                    await page.keyboard.press('Enter');
                    await page.keyboard.up('Control');

                    await new Promise(r => setTimeout(r, 2000));

                    // Fallback Send Button
                    const isStillThere = await page.evaluate(() => {
                         const sendBtn = document.querySelector('div[role="button"][aria-label*="Send"]');
                         return !!sendBtn && sendBtn.offsetParent !== null;
                    });
                    if (isStillThere) {
                        await page.click('div[role="button"][aria-label*="Send"]');
                    }

                    console.log(`Sent to ${to}`);
                    sentCount++;

                    // Batching
                    if ((i + 1) % batchSize === 0 && (i + 1) < recipients.length) {
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
                    }

                } catch (err) {
                    console.error(`ERROR sending to ${to}:`, err.message);
                }
            }

            return { success: true, sentCount };

        } catch (error) {
            console.error('Mail Service Error:', error);
            throw error;
        }
        // Do not close browser finally, keep it alive for next batch
    }
}

module.exports = new MailService();
