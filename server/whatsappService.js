const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');

class WhatsAppService {
  constructor(io) {
    this.io = io;
    this.client = null;
    this.isConnected = false;

    this.initialize();
  }

  initialize() {
    console.log('Initializing WhatsApp Client...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: 'kitty-client-v2' }),
      puppeteer: {
        headless: true, // Reverting to headless for stability
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
      }
    });

    // Prevent server crash on library errors
    process.on('uncaughtException', (err) => {
        console.error('Caught exception: ' + err);
        // Do not exit
    });

    process.on('unhandledRejection', (reason, p) => {
       console.error('Unhandled Rejection at:', p, 'reason:', reason);
       // Do not exit
    });

    this.client.on('qr', (qr) => {
      console.log('QR RECEIVED', qr);
      this.io.emit('qr', qr);
      this.io.emit('status', 'waiting_for_scan');
    });

    this.client.on('ready', () => {
      console.log('WhatsApp Client is ready!');
      this.isConnected = true;
      this.io.emit('status', 'connected');
      this.io.emit('ready');
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp Authenticated');
      this.io.emit('status', 'authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('AUTHENTICATION FAILURE', msg);
      this.io.emit('status', 'auth_failure');
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp Client was logged out', reason);
      this.isConnected = false;
      this.io.emit('status', 'disconnected');
    });

    console.log('Calling client.initialize()...');
    this.client.initialize().then(() => {
        console.log('client.initialize() promise resolved');
    }).catch(err => {
        console.error('client.initialize() failed:', err);
    });
    console.log('client.initialize() called');

    // Socket.io connection handling
    this.io.on('connection', (socket) => {
      console.log('New client connected to socket');
      
      // If already connected, inform the new client
      if (this.isConnected) {
        socket.emit('status', 'connected');
      }

      socket.on('disconnect', () => {
        console.log('Client disconnected from socket');
      });

      socket.on('send_bulk', async (data) => {
        const { message, numbers } = data;
        console.log(`Received bulk send request for ${numbers.length} numbers.`);
        
        if (!this.isConnected) {
          socket.emit('log', { type: 'error', message: 'WhatsApp is not connected.' });
          return;
        }

        let successCount = 0;
        let failCount = 0;
        const page = this.client.pupPage;

        for (const number of numbers) {
          try {
            // 1. Sanitize and Format Number
            let sanitized = number.replace(/\D/g, '');
            if (sanitized.length === 10) sanitized = '91' + sanitized; // Default to India
            
            console.log(`Navigating to chat for ${sanitized}...`);
            socket.emit('log', { type: 'info', message: `Preparing to send to ${sanitized}...` });

            // 2. Navigate using the official "Click to Chat" URL API
            // This forces the UI to load the correct chat without needed internal Store access
            // Removed text param from URL to prevent duplicates/drafts
            const targetUrl = `https://web.whatsapp.com/send?phone=${sanitized}`;
            
            await page.evaluate((url) => {
                window.location.href = url;
            }, targetUrl);

                // 3. Wait for the chat to load
                const inputSelectors = [
                    '#main footer div[contenteditable="true"][role="textbox"]',
                    '#main footer div[contenteditable="true"]',
                    '#main div[contenteditable="true"]'
                ];
                
                console.log(`Waiting for chat UI for ${sanitized}...`);
                
                // Wait for input box
                let inputSelector = null;
                try {
                     const foundSelector = await page.waitForFunction((selectors) => {
                        for (const s of selectors) if (document.querySelector(s)) return s;
                        return null;
                     }, { timeout: 60000 }, inputSelectors);
                     inputSelector = await foundSelector.jsonValue();
                } catch (e) {
                     // Check for invalid number popup
                     const isInvalid = await page.evaluate(() => document.body.innerText.includes('Phone number shared via url is invalid'));
                     if (isInvalid) throw new Error("Number is invalid on WhatsApp");
                     throw new Error("Chat input box not found (Timeout)");
                }

                // 4. Type and Send
                console.log(`Typing message into ${inputSelector}...`);
                const inputElement = await page.$(inputSelector);
                if (!inputElement) throw new Error("Input element lost");

                // Clear input rigorous (Select All + Delete) to remove any drafts
                await inputElement.focus();
                await page.keyboard.down('Control');
                await page.keyboard.press('A');
                await page.keyboard.up('Control');
                await page.keyboard.press('Backspace');
                await new Promise(r => setTimeout(r, 200));
                
                // Type message - STRATEGY: Hybrid (Type + Wake Up)
                await inputElement.focus();
                
                // 1. execCommand (Fastest way to get text in)
                await page.evaluate((msg) => {
                    document.execCommand('insertText', false, msg);
                }, message);
                
                // 2. Wake Up React: Type Space then Backspace
                // This forces the "Send" button to detect a change
                await page.keyboard.type(' ');
                await new Promise(r => setTimeout(r, 200));
                await page.keyboard.press('Backspace');
                
                await new Promise(r => setTimeout(r, 1000)); // Wait for Send button to activate

                // Strategy 3: Explicitly Wait for Send Button
                const sendSelectors = [
                    'span[data-icon="send"]',
                    'button[aria-label="Send"]',
                    'div[role="button"][aria-label="Send"]',
                    '#main footer button'
                ];
                
                let sendBtn = null;
                for (const btnSel of sendSelectors) {
                    try {
                        sendBtn = await page.waitForSelector(btnSel, { timeout: 2000 });
                        if (sendBtn) {
                            console.log(`Send button found: ${btnSel}`);
                            break;
                        }
                    } catch (e) {}
                }

                if (sendBtn) {
                    console.log('Clicking Send Button...');
                    await sendBtn.click();
                } else {
                    console.log('Send button not found, forcing Enter...');
                    await page.keyboard.press('Enter');
                }

                // 5. Verification: Check if Input is Empty
                await new Promise(r => setTimeout(r, 2000));
                
                const isSent = await page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    return el && el.innerText.trim() === '';
                }, inputSelector);

                if (isSent) {
                    console.log('Message sent verified (input cleared)');
                    successCount++;
                    socket.emit('log', { type: 'success', message: `Sent to ${sanitized}` });
                } else {
                    console.error('Input not clear, message failed.');
                    failCount++;
                    socket.emit('log', { type: 'error', message: `Failed to ${number}: Message stuck in input box` });
                }

            // 6. Delay before next
            await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
            
          } catch (error) {
            console.error(`Failed to send to ${number}:`, error);
            failCount++;
            socket.emit('log', { type: 'error', message: `Failed to ${number}: ${error.message}` });
          }
        }
        
        socket.emit('bulk_complete', { success: successCount, failure: failCount });
        
        // Return to main page to be clean? No need, next iteration will navigate.
      });
      
      // Listen for logout request
      socket.on('logout', async () => {
          if (this.client) {
              await this.client.logout();
              // Re-initialize to allow new login
              this.client.destroy();
              this.initialize();
          }
      });
    });
  }
}

module.exports = WhatsAppService;
