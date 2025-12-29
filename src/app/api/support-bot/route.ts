
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the Support Bot for SkillFind.pro.
CORE PLATFORM RULES:
1. Pricing: Pros pay €0.10/click. Clients post free.
2. Verification: Identity Verification via iDenfy is REQUIRED for "Verified Professional" badge.
3. Flow: Client Requests -> Pro Offers -> Client Clicks (€0.10) -> Contact Info.
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        // 1. Check if key exists
        if (!apiKey) {
            console.warn("Missing OPENAI_API_KEY, returning mock.");
            return NextResponse.json({
                message: { role: 'assistant', content: "[MOCK] Please configure OPENAI_API_KEY in .env. \n\nHello! I am the SkillFind Support Bot. How can I help you?" }
            });
        }

        // 2. Attempt OpenAI Call
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages
                ],
                temperature: 0.7,
            }),
        });

        // 3. Handle API Errors (specifically invalid key)
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', errorText);

            // Fallback for invalid key to keep UI working
            if (response.status === 401) {
                return NextResponse.json({
                    message: {
                        role: 'assistant',
                        content: "⚠️ **API Key Error**: The provided OpenAI API Key is invalid or expired.\n\n(This is a mock response so you can test the UI. Please check your .env file)"
                    }
                });
            }

            return NextResponse.json({ error: 'Failed to connect to AI' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json({ message: data.choices[0].message });

    } catch (error) {
        console.error('Support Bot Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
