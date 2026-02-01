const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = null;
    }

    async createTransporter(user, pass) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass // App Password
            }
        });
        
        // Verify connection
        await this.transporter.verify();
    }

    async sendEmailBatch(recipients, subject, message, onProgress) {
        if (!this.transporter) {
            throw new Error("Transporter not initialized");
        }

        const batchSize = 5;
        const results = {
            success: [],
            failure: []
        };

        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            console.log(`Sending batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(recipients.length / batchSize)}...`);

            const promises = batch.map(async (to) => {
                try {
                    await this.transporter.sendMail({
                        from: this.transporter.options.auth.user,
                        to: to.trim(),
                        subject: subject,
                        text: message
                    });
                    results.success.push(to);
                    if (onProgress) onProgress({ type: 'success', email: to });
                } catch (err) {
                    console.error(`Failed to send to ${to}:`, err.message);
                    results.failure.push({ email: to, error: err.message });
                    if (onProgress) onProgress({ type: 'error', email: to, error: err.message });
                }
            });

            await Promise.all(promises);

            if (i + batchSize < recipients.length) {
                console.log("Waiting 5 seconds before next batch...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        return results;
    }
}

module.exports = new MailService();
