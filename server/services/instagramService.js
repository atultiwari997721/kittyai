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
        console.log(`Starting Instagram automation. Small window mode.`);
        
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-notifications',
                '--window-size=450,800',
                `--user-data-dir=${this.sessionPath}`
            ],
            defaultViewport: null // Allow window size to take precedence
        });

        const pages = await browser.pages();
        const page = pages[0];
        // Set a smaller viewport that fits well on screen
        await page.setViewport({ width: 450, height: 750 });
        
        try {
            // 1. Navigate to Instagram
            await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
            
            console.log('Waiting for user to be logged in and ready...');
            // Wait until we see evidence of being logged in (Direct inbox or profile icon)
            // We give the user 2 minutes to select/log in manually if needed
            await page.waitForFunction(() => {
                return !!document.querySelector('a[href*="/direct/inbox/"]') || 
                       !!document.querySelector('svg[aria-label="Direct"]') ||
                       !!document.querySelector('img[alt*="profile picture"]');
            }, { timeout: 120000 });

            console.log('User is logged in. Starting automation in 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Handle common popups automatically
            try {
                const notNowBtns = await page.$$('button');
                for (const btn of notNowBtns) {
                    const text = await page.evaluate(el => el.textContent, btn);
                    if (text === 'Not Now') {
                        await btn.click();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } catch (e) {
                console.log('Popup handling error (non-critical):', e.message);
            }

            // 3. Navigate to Suggestions
            console.log('Navigating to suggestions list...');
            await page.goto('https://www.instagram.com/explore/people/', { waitUntil: 'networkidle2' });

            // 4. Start Following
            let followedCount = 0;
            
            while (followedCount < count) {
                // Find "Follow" buttons
                const followButtons = await page.$$('button');
                const validButtons = [];
                
                for (const btn of followButtons) {
                    const text = await page.evaluate(el => el.textContent, btn);
                    if (text === 'Follow') {
                        validButtons.push(btn);
                    }
                }

                console.log(`Found ${validButtons.length} candidates to follow.`);

                if (validButtons.length === 0) {
                    console.log('End of list or no more suggestions found.');
                    // Try scrolling to trigger more loads
                    await page.evaluate(() => window.scrollBy(0, 800));
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    // Re-check after scroll
                    const retryButtons = await page.$$('button');
                    let hasNew = false;
                    for (const btn of retryButtons) {
                        if (await page.evaluate(el => el.textContent, btn) === 'Follow') hasNew = true;
                    }
                    if (!hasNew) break; 
                    continue;
                }

                for (let i = 0; i < validButtons.length && followedCount < count; i++) {
                    const btn = validButtons[i];
                    try {
                        const isInteractable = await btn.isIntersectingViewport();
                        if (!isInteractable) {
                            await btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                        
                        await btn.click();
                        followedCount++;
                        console.log(`Ai Progress: ${followedCount}/${count}`);

                        // Random human-like delay
                        const delay = Math.floor(Math.random() * 5000) + 4000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } catch (err) {
                        console.error('Action failed:', err.message);
                    }
                }

                // Scroll down to load more
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await new Promise(resolve => setTimeout(resolve, 4000));
            }

            console.log(`Task Complete. Total followed: ${followedCount}`);
            return { success: true, followedCount };

        } catch (error) {
            console.error('Fatal Service Error:', error);
            try {
                await page.screenshot({ path: path.join(__dirname, '..', `insta_crash_${Date.now()}.png`) });
            } catch (e) {}
            return { success: false, error: error.message };
        } finally {
            // Give user a moment to see the final result before closing
            await new Promise(resolve => setTimeout(resolve, 5000));
            await browser.close();
            console.log('Browser session finished.');
        }
    }
}

module.exports = new InstagramService();
