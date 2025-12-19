import 'server-only';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'notifications@skillfind.pro';
const IS_MOCK = !process.env.SENDGRID_API_KEY;

type EmailParams = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
};

/**
 * Send an email using SendGrid or Log to Console
 */
export async function sendEmail({ to, subject, text, html }: EmailParams): Promise<boolean> {
    if (IS_MOCK) {
        console.log(`
      📧 [MOCK EMAIL] 
      ----------------------------------------
      To: ${to}
      From: ${FROM_EMAIL}
      Subject: ${subject}
      
      [CONTENT]:
      ${text || html?.replace(/<[^>]*>/g, '')}
      ----------------------------------------
    `);
        return true;
    }

    try {
        await sgMail.send({
            to,
            from: FROM_EMAIL,
            subject,
            text: text || '',
            html: html || text || '',
        });
        return true;
    } catch (error) {
        console.error('SendGrid Error:', error);
        return false;
    }
}

/**
 * Send Welcome Email
 */
export async function sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to SkillFind.pro!';
    const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1>Welcome, ${name}!</h1>
      <p>We are thrilled to have you on board SkillFind.pro.</p>
      <p>Find the best professionals or grow your business with us.</p>
      <br />
      <a href="https://skillfind.pro" style="background: #3B4D9D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
    </div>
  `;
    const text = `Welcome, ${name}! We are thrilled to have you on board SkillFind.pro.`;

    return sendEmail({ to, subject, html, text });
}

/**
 * Send Generic Notification Email
 */
export async function sendNotificationEmail(to: string, title: string, message: string, actionUrl?: string) {
    const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>${title}</h2>
      <p>${message}</p>
      ${actionUrl ? `
        <br />
        <a href="${actionUrl.startsWith('http') ? actionUrl : `https://skillfind.pro${actionUrl}`}" 
           style="background: #3B4D9D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           View Details
        </a>
      ` : ''}
    </div>
  `;

    return sendEmail({ to, subject: title, html, text: message });
}
