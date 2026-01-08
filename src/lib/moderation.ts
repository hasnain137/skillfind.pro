import 'server-only';
import { getConfig } from '@/lib/config';

interface ModerationResult {
    safe: boolean;
    categories: string[];
    error?: string;
}

export async function moderateContent(text: string): Promise<ModerationResult> {
    try {
        // Use dedicated moderation API key, fallback to general key
        const apiKey = await getConfig('OPENAI_MODERATION_API_KEY') || await getConfig('OPENAI_API_KEY');

        // If no key is set, we log a warning but allow content to pass to avoid breaking the app.
        // In a strict environment, you might want to return safe: false here.
        if (!apiKey) {
            console.warn('OPENAI_API_KEY is missing. Skipping moderation.');
            return { safe: true, categories: [] };
        }

        const response = await fetch('https://api.openai.com/v1/moderations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'omni-moderation-latest',
                input: text,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI Moderation API Error:', errorText);
            // Fail open (allow content) but log error
            return { safe: true, categories: [], error: 'API Error' };
        }

        const data = await response.json();
        const result = data.results[0];

        if (result.flagged) {
            // Extract the category names that were flagged
            const flaggedCategories = Object.keys(result.categories).filter(
                (cat) => result.categories[cat]
            );
            return { safe: false, categories: flaggedCategories };
        }

        return { safe: true, categories: [] };

    } catch (error) {
        console.error('Moderation Logic Error:', error);
        return { safe: true, categories: [], error: 'Internal Error' };
    }
}
