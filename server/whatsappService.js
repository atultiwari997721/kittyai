const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs');

class WhatsAppService {
  constructor(io) {
    this.io = io;
    this.initializationPromise = this.initialize();
    this.sock = null;
    this.isConnected = false;
  }

  async initialize() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    console.log('Initializing Baileys WhatsApp Socket...');
    this.io.emit('status', 'initializing');
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        this.sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: pino({ level: 'silent' }),
          browser: ["KittyAi", "Chrome", "1.0.0"],
          connectTimeoutMs: 60000, 
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect, qr } = update;

          if (qr) {
            console.log('QR Received from Baileys');
            try {
                const dataUrl = await QRCode.toDataURL(qr);
                this.io.emit('qr', dataUrl);
                this.io.emit('status', 'waiting_for_scan');
            } catch (err) {
                console.error('QR Gen Error', err);
            }
          }

          if (connection === 'close') {
            const statusCode = (lastDisconnect.error)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log('Connection closed:', statusCode, 'Reconnecting:', shouldReconnect);
            this.isConnected = false;
            this.io.emit('status', 'disconnected');
            
            if (shouldReconnect) {
                // Wait 3 seconds before reconnecting to prevent loops
                console.log('Waiting 3s before reconnect...');
                setTimeout(() => {
                    this.isReconnecting = false;
                    this.initialize();
                }, 3000);
            } else {
                console.log('Logged out. Clearing session.');
                if (fs.existsSync('auth_info_baileys')) {
                    try {
                        fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                    } catch (err) {
                        console.error('Failed to clear session:', err.message);
                    }
                }
                this.isReconnecting = false;
                this.initialize(); 
            }
          } else if (connection === 'open') {
            console.log('Opened connection to WhatsApp!');
            this.isConnected = true;
            this.isReconnecting = false;
            this.io.emit('status', 'connected');
            this.io.emit('ready');
          }
        });
    } catch (err) {
        console.error("Initialization Failed:", err);
        this.isReconnecting = false;
        setTimeout(() => this.initialize(), 5000);
    }


    // Handle Socket.IO (Restored)
    this.io.on('connection', (socket) => {
        console.log('Client connected to socket.io');
        
        if (this.isConnected) {
            socket.emit('status', 'connected');
        } else {
             socket.emit('status', 'initializing');
        }

        socket.on('logout', async () => {
            console.log('Logout requested');
            try {
                await this.sock.logout();
            } catch (e) { console.error('Logout error', e); }
            
            if (fs.existsSync('auth_info_baileys')) {
                try {
                    fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                } catch (err) {
                    console.error('Failed to clear session:', err.message);
                }
            }
            this.isConnected = false;
            this.isReconnecting = false;
            this.initialize();
        });

            socket.on('send_bulk', async (data) => {
                console.log('BACKEND: Received send_bulk event', { 
                    numbersCount: data.numbers ? data.numbers.length : 0, 
                    hasImage: !!data.image, 
                    hasMessage: !!data.message 
                });

                const { message, numbers, image, caption } = data;

                if (!this.isConnected) {
                    console.log('BACKEND: Failed - User not connected');
                    socket.emit('log', { type: 'error', message: 'WhatsApp not connected. Please scan QR Code first.' });
                    return;
                }

            let successCount = 0;
            let failCount = 0;

            console.log(`Starting bulk send to ${numbers.length} numbers`);

            for (const number of numbers) {
                try {
                    // Format number: '91xxxxxxxxxx@s.whatsapp.net'
                    let formatted = number.replace(/\D/g, '');
                    if (formatted.length === 10) formatted = '91' + formatted;
                    const jid = formatted + '@s.whatsapp.net';

                    console.log(`Sending to ${jid}...`);
                    socket.emit('log', { type: 'info', message: `Processing ${formatted} (${successCount + failCount + 1}/${numbers.length})` });

                    // Minimal delay
                     await delay(500 + Math.random() * 500);

                    // 1. Send Image
                    if (image) {
                        // Extract base64
                        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches) {
                            const buffer = Buffer.from(matches[2], 'base64');
                            await this.sock.sendMessage(jid, { 
                                image: buffer, 
                                caption: caption || '' 
                            });
                            socket.emit('log', { type: 'success', message: 'Image sent' });
                        }
                    }

                    // 2. Send Text
                    if (message) {
                        if(image) await delay(500);
                        await this.sock.sendMessage(jid, { text: message });
                        socket.emit('log', { type: 'success', message: 'Text sent' });
                    }

                    successCount++;
                    socket.emit('log', { type: 'success', message: `Sent to ${formatted}` });

                } catch (err) {
                    console.error(`Failed ${number}`, err);
                    failCount++;
                    socket.emit('log', { type: 'error', message: `Failed ${number}: ${err.message}` });
                }
            }

            socket.emit('bulk_complete', { success: successCount, failure: failCount });
        });
    });
  }
}

module.exports = WhatsAppService;
