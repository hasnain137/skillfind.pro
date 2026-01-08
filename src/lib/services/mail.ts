
import { Resend } from 'resend';
import { getConfig } from '@/lib/config';

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, text, html }: EmailParams): Promise<boolean> {
  // Read env vars at runtime (or from DB via getConfig)
  const apiKey = await getConfig('RESEND_API_KEY');
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  // Check if we should mock
  // We mock if no key is present OR if the key explicitly starts with 're_mock' (used for testing)
  const isMock = !apiKey || apiKey.startsWith('re_mock');

  // 1. Mock Mode (Development / No API Key)
  if (isMock) {
    console.log(`
      📧 [MOCK EMAIL - Resend] 
      ----------------------------------------
      To: ${to}
      From: ${fromEmail}
      Subject: ${subject}
      
      [CONTENT]:
      ${text || html?.replace(/<[^>]*>/g, '')}
      ----------------------------------------
      [DEBUG] Key status: ${apiKey ? 'Present' : 'Missing'}
    `);
    return true;
  }

  // 2. Real Mode (Resend)
  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: subject,
      html: html || text, // Resend requires html or text. HTML is preferred usually.
      text: text, // Fallback
    });

    if (error) {
      console.error('Resend Error:', error);
      return false;
    }

    console.log(`✅ Email sent to ${to} (ID: ${data?.id})`);
    return true;
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    return false;
  }
}


/**
 * Send a welcome email to a new user
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
 * Send a generic notification email
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
