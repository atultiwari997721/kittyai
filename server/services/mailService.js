const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = null;
        this.currentUser = null;
    }

    async verifyConnection(email, appPassword) {
        console.log(`Verifying connection for ${email}...`);
        
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: email,
                    pass: appPassword
                }
            });

            await transporter.verify();
            console.log('SMTP connection verified.');
            
            // store for subsequent sends
            this.transporter = transporter;
            this.currentUser = email;
            
            return { success: true };
        } catch (error) {
            console.error('SMTP Verification failed:', error);
            throw new Error('Failed to connect. Ensure you are using a valid App Password (NOT your login password).');
        }
    }

    async sendEmailBatch(recipients, subject, message, senderEmail, appPassword) {
        console.log(`Starting SMTP Broadcast for ${recipients.length} recipients...`);

        // Use stored transporter if matches, or create new one if credentials provided (stateless preferred for API)
        let transporter = this.transporter;
        
        if (appPassword && senderEmail) {
             transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: senderEmail,
                    pass: appPassword
                }
            });
        }
        
        if (!transporter) {
            throw new Error('No active mail session. Please connect first or provide credentials.');
        }

        let sentCount = 0;
        const failed = [];

        for (let i = 0; i < recipients.length; i++) {
            const to = recipients[i].trim();
            if (!to) continue;

            try {
                // Add a small delay to avoid hitting rate limits too fast
                if (i > 0) await new Promise(r => setTimeout(r, 1000));
                
                await transporter.sendMail({
                    from: senderEmail || this.currentUser,
                    to: to,
                    subject: subject,
                    text: message,
                    // html: message // Use html if you want rich text later
                });

                console.log(`Sent to ${to}`);
                sentCount++;
            } catch (err) {
                console.error(`Failed to send to ${to}:`, err.message);
                failed.push({ email: to, error: err.message });
            }
        }

        return { success: true, sentCount, failed };
    }
}

module.exports = new MailService();
