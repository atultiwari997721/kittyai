const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class InstagramService {
    constructor() {
        this.sessionPath = path.join(__dirname, '..', 'instagram_session');
        if (!fs.existsSync(this.sessionPath)) {
            fs.mkdirSync(this.sessionPath, { recursive: true });
        }
    }

    async followSuggestedUsers(username, password, count) {
        console.log(`Starting Home Feed automation. Goal: ${count}`);
        
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-notifications',
                '--window-size=1000,900', // Wider window to see sidebar and feed
                `--user-data-dir=${this.sessionPath}`
            ],
            defaultViewport: null
        });

        const pages = await browser.pages();
        const page = pages[0];
        
        try {
            // 1. Navigate to Instagram Home
            await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
            
            console.log('Waiting for manual session confirmation...');
            await page.waitForFunction(() => {
                return !!document.querySelector('a[href*="/direct/inbox/"]') || 
                       !!document.querySelector('svg[aria-label="Direct"]') ||
                       !!document.querySelector('img[alt*="profile picture"]') ||
                       !!document.querySelector('svg[aria-label="Home"]');
            }, { timeout: 120000 });

            console.log('Session verified. Targeting Home Feed suggestions...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await this.handlePopups(page);

            let followedCount = 0;
            let refreshAttempts = 0;
            const maxRefreshAttempts = 20;

            while (followedCount < count && refreshAttempts < maxRefreshAttempts) {
                console.log(`Scanning Home Feed (Attempt ${refreshAttempts + 1})...`);
                
                // Ensure we are at the top to see the in-feed suggestions
                await page.evaluate(() => window.scrollTo(0, 0));
                await new Promise(resolve => setTimeout(resolve, 3000));

                let followedOnThisPage = 0;

                // We'll look for the "Suggestions for you" section specifically
                // It usually contains Follow buttons. We search for the specific container if possible.
                const followButtons = await page.evaluate(() => {
                    // Find the "Suggestions for you" text
                    const headings = Array.from(document.querySelectorAll('span, div, h2'));
                    const targetHeading = headings.find(el => el.innerText.includes('Suggestions for you'));
                    
                    if (!targetHeading) return [];

                    // Find the closest container that likely holds the carousel/list
                    let container = targetHeading.parentElement;
                    while (container && !container.innerText.includes('Follow')) {
                        container = container.parentElement;
                    }

                    if (!container) return [];

                    // Find all buttons inside this specific container
                    const buttons = Array.from(container.querySelectorAll('button'));
                    return buttons
                        .filter(btn => btn.innerText.trim() === 'Follow')
                        .map((btn, index) => ({
                            index,
                            text: btn.innerText.trim()
                        }));
                });

                console.log(`Found ${followButtons.length} follow candidates in the home feed bar.`);

                if (followButtons.length > 0) {
                    for (let i = 0; i < followButtons.length && followedCount < count; i++) {
                        // Re-fetch buttons to ensure reference is valid
                        const success = await page.evaluate(async (targetIndex) => {
                            const headings = Array.from(document.querySelectorAll('span, div, h2'));
                            const targetHeading = headings.find(el => el.innerText.includes('Suggestions for you'));
                            if (!targetHeading) return false;

                            let container = targetHeading.parentElement;
                            while (container && !container.innerText.includes('Follow')) {
                                container = container.parentElement;
                            }
                            if (!container) return false;

                            const buttons = Array.from(container.querySelectorAll('button'))
                                .filter(btn => btn.innerText.trim() === 'Follow');
                            
                            if (buttons[targetIndex]) {
                                buttons[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                                await new Promise(r => setTimeout(r, 500));
                                buttons[targetIndex].click();
                                return true;
                            }
                            return false;
                        }, i);

                        if (success) {
                            followedCount++;
                            followedOnThisPage++;
                            console.log(`Followed: ${followedCount}/${count}`);
                            
                            // Human-like delay
                            const delay = Math.floor(Math.random() * 4000) + 6000;
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                }

                if (followedCount < count) {
                    console.log('Exhausted current visible suggestions. Refreshing home page...');
                    await page.reload({ waitUntil: 'networkidle2' });
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    await this.handlePopups(page);
                    refreshAttempts++;
                } else {
                    console.log('Reached follow target!');
                }
            }

            console.log(`Automation Complete. Total: ${followedCount}`);
            return { success: true, followedCount };

        } catch (error) {
            console.error('Home Feed Error:', error);
            return { success: false, error: error.message };
        } finally {
            await new Promise(resolve => setTimeout(resolve, 5000));
            await browser.close();
        }
    }

    async handlePopups(page) {
        try {
            const popupTexts = ['Not Now', 'Dismiss', 'Maybe Later'];
            const buttons = await page.$$('button');
            for (const btn of buttons) {
                const text = await page.evaluate(el => el.innerText || el.textContent, btn);
                if (popupTexts.some(t => text.includes(t))) {
                    await btn.click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (e) {}
    }
}

module.exports = new InstagramService();
