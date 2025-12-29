import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Manual .env parser since dotenv might not be there
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            envContent.split('\n').forEach(line => {
                const [key, val] = line.split('=');
                if (key && val) {
                    process.env[key.trim()] = val.trim();
                }
            });
        }
    } catch (e) {
        console.error('Failed to load .env', e);
    }
}

async function main() {
    loadEnv();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('❌ RESEND_API_KEY not found in .env');
        process.exit(1);
    }

    const email = 'moashniz1999@gmail.com';
    // Use relative path carefully. We assume running from project root.
    // Artifact path: C:\Users\hassn\.gemini\antigravity\brain\d1306942-35ab-41fc-99d9-3b88cac3cbb9\client_requirements.md
    // This path is OUTSIDE the project root usually? 
    // Wait, in Step 1140 I said: `c:\Users\hassn\.gemini\antigravity\brain...`
    // That is NOT in `c:\Users\hassn\skillfind`.

    // So I must use the absolute path provided in my Artifact Metadata.
    const filePath = String.raw`c:\Users\hassn\.gemini\antigravity\brain\d1306942-35ab-41fc-99d9-3b88cac3cbb9\client_requirements.md`;

    console.log(`Checking file at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found at: ${filePath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Client Requirements Document</h2>
      <p>Here is the document you requested.</p>
      <hr />
      <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 15px;">${content}</pre>
    </div>
  `;

    console.log(`Sending email to ${email} using key: ${apiKey.substring(0, 5)}...`);

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [email],
            subject: 'SkillFind - Client Requirements Document',
            text: content,
            html: htmlContent
        });

        if (error) {
            console.error('Resend API Error:', error);
        } else {
            console.log(`✅ Email sent successfully! ID: ${data?.id}`);
        }
    } catch (err) {
        console.error('Script Error:', err);
    }
}

main().catch(console.error);
