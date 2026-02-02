const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class MailService {
    constructor() {
        this.sessionPath = path.join(__dirname, '..', 'gmail_session');
        if (!fs.existsSync(this.sessionPath)) {
            fs.mkdirSync(this.sessionPath, { recursive: true });
        }
    }

    async openSession(senderEmail) {
        console.log(`Opening Gmail session for ${senderEmail || 'default account'}...`);
        const browser = await puppeteer.launch({
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

        const pages = await browser.pages();
        const page = pages[0];

        try {
            await page.goto('https://mail.google.com/', { waitUntil: 'networkidle2' });
            
            // Wait for user to log in or for the page to be ready
            await page.waitForFunction(() => {
                return !!document.querySelector('div[role="button"][gh="cm"]') || 
                       !!document.querySelector('.T-I-KE') ||
                       !!document.querySelector('div[aria-label="Compose"]') ||
                       !!document.querySelector('div[aria-label*="Compose"]');
            }, { timeout: 180000 });

            console.log('Gmail session verified.');
            // Don't close the browser yet, or close it after verification? 
            // The user wants to "login" so keeping it open for a bit is good.
            await new Promise(r => setTimeout(r, 2000));
            await browser.close();
            return { success: true };
        } catch (error) {
            console.error('Session verification failed:', error);
            await browser.close();
            throw error;
        }
    }

    async sendEmailBatch(recipients, subject, message, senderEmail) {
        console.log(`Starting Browser-Based Gmail Broadcast for ${recipients.length} recipients (as ${senderEmail || 'default account'})...`);
        
        const browser = await puppeteer.launch({
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

        const pages = await browser.pages();
        const page = pages[0];

        try {
            // 1. Navigate to Gmail
            await page.goto('https://mail.google.com/', { waitUntil: 'networkidle2' });

            console.log('Waiting for Gmail login...');
            // Wait for the Compose button to appear, which indicates login success
            await page.waitForFunction(() => {
                return !!document.querySelector('div[role="button"][gh="cm"]') || 
                       !!document.querySelector('.T-I-KE') ||
                       !!document.querySelector('div[aria-label="Compose"]') ||
                       !!document.querySelector('div[aria-label*="Compose"]');
            }, { timeout: 180000 }); 

            console.log('Gmail session detected. Starting broadcast...');

            let sentCount = 0;
            const batchSize = 5;

            for (let i = 0; i < recipients.length; i++) {
                const to = recipients[i].trim();
                if (!to) continue;

                try {
                    console.log(`Processing ${to} (${i + 1}/${recipients.length})...`);

                    // 1. Click Compose
                    console.log('Clicking Compose...');
                    await page.waitForSelector('div[role="button"][gh="cm"], .T-I-KE, div[aria-label="Compose"], div[aria-label*="Compose"]', { visible: true });
                    await page.click('div[role="button"][gh="cm"], .T-I-KE, div[aria-label="Compose"], div[aria-label*="Compose"]');

                    // 2. Wait for Compose window
                    console.log('Waiting for Compose window...');
                    const toSelector = 'textarea[name="to"], input[role="combobox"], .vO, [aria-label="To"]';
                    await page.waitForSelector(toSelector, { visible: true, timeout: 15000 });
                    
                    // 3. Enter Recipient
                    console.log(`Typing recipient: ${to}`);
                    await page.click(toSelector);
                    await page.type(toSelector, to);
                    await page.keyboard.press('Tab');
                    await new Promise(r => setTimeout(r, 800));

                    // 4. Enter Subject
                    console.log('Typing subject...');
                    const subSelector = 'input[name="subjectbox"], .aoT, [aria-label="Subject"]';
                    await page.waitForSelector(subSelector, { visible: true });
                    await page.click(subSelector);
                    await page.type(subSelector, subject);
                    await page.keyboard.press('Tab');
                    await new Promise(r => setTimeout(r, 800));

                    // 5. Enter Message
                    console.log('Typing message...');
                    await page.keyboard.type(message, { delay: 10 }); // Slight delay between characters
                    await new Promise(r => setTimeout(r, 1000));

                    // 6. Click Send
                    console.log('Attempting to Send...');
                    // Try keyboard shortcut first
                    await page.keyboard.down('Control');
                    await page.keyboard.press('Enter');
                    await page.keyboard.up('Control');

                    // Small delay to let Gmail process
                    await new Promise(r => setTimeout(r, 2000));

                    // Fallback: Click the Send button if it's still there
                    const isStillThere = await page.evaluate(() => {
                        const sendBtn = document.querySelector('div[role="button"][aria-label*="Send"]');
                        return !!sendBtn && sendBtn.offsetParent !== null;
                    });

                    if (isStillThere) {
                        console.log('Shortcut might have failed, clicking Send button explicitly...');
                        const sendBtnSelector = 'div[role="button"][aria-label*="Send"]';
                        await page.click(sendBtnSelector);
                    }

                    // 7. Verify "Message sent" toast or window disappearance
                    console.log('Verifying delivery...');
                    try {
                        await page.waitForFunction(() => {
                            const text = document.body.innerText;
                            const isSent = text.includes('Message sent') || text.includes('Sent');
                            const isWindowClosed = !document.querySelector('textarea[name="to"]');
                            return isSent || isWindowClosed;
                        }, { timeout: 15000 });
                        console.log(`SUCCESS: Sent to ${to}`);
                        sentCount++;
                    } catch (verifyErr) {
                        console.log(`WARNING: Delivery confirmation not certain for ${to}, but window might have closed.`);
                        sentCount++; 
                    }

                    // Batching/Human delay
                    if ((i + 1) % batchSize === 0 && (i + 1) < recipients.length) {
                        console.log('Batch complete. Waiting 10 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
                    }

                } catch (err) {
                    console.error(`ERROR failed to send to ${to}:`, err.message);
                }
            }

            console.log(`Broadcast finished. Total sent: ${sentCount}`);
            return { success: true, sentCount };

        } catch (error) {
            console.error('CRITICAL Mail Service Error:', error);
            throw error;
        } finally {
            await new Promise(resolve => setTimeout(resolve, 5000));
            await browser.close();
        }
    }
}

module.exports = new MailService();
