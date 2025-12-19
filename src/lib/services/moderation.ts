import 'server-only';

const PERSPECTIVE_API_URL = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

interface ModerationResult {
    isSafe: boolean;
    score: number;
    tags: string[];
    error?: string;
    isMock: boolean;
}

export async function analyzeContent(text: string): Promise<ModerationResult> {
    const apiKey = process.env.GOOGLE_PERSPECTIVE_API_KEY;

    // Mock mode if key is missing
    if (!apiKey) {
        console.log('[Moderation] Mock Check: Content assumed safe.', { text: text.substring(0, 50) + '...' });

        // Simple mock keyword check for testing logic without API
        const mockBadWords = ['badword_test_mock'];
        if (mockBadWords.some(w => text.includes(w))) {
            return {
                isSafe: false,
                score: 0.99,
                tags: ['TOXICITY (MOCK)'],
                isMock: true,
            };
        }

        return {
            isSafe: true,
            score: 0,
            tags: [],
            isMock: true,
        };
    }

    try {
        const response = await fetch(`${PERSPECTIVE_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                comment: { text },
                languages: ['en', 'fr'], // Support English and French
                requestedAttributes: {
                    TOXICITY: {},
                    SEVERE_TOXICITY: {},
                    PROFANITY: {},
                    THREAT: {},
                    INSULT: {},
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Perspective API error: ${response.statusText}`);
        }

        const data = await response.json();
        const scores = data.attributeScores;

        // Check specific attributes
        const toxicity = scores.TOXICITY?.summaryScore?.value || 0;
        const severeToxicity = scores.SEVERE_TOXICITY?.summaryScore?.value || 0;
        const threat = scores.THREAT?.summaryScore?.value || 0;

        // Determine safety threshold (e.g., > 0.7 is flagged)
        const MAX_SCORE = 0.7;
        const tags: string[] = [];

        if (toxicity > MAX_SCORE) tags.push('TOXICITY');
        if (severeToxicity > MAX_SCORE) tags.push('SEVERE_TOXICITY');
        if (threat > MAX_SCORE) tags.push('THREAT');

        const isSafe = tags.length === 0;

        return {
            isSafe,
            score: Math.max(toxicity, severeToxicity, threat),
            tags,
            isMock: false,
        };
    } catch (error) {
        console.error('Moderation API failed:', error);
        // Fail Open (Allow content if API fails? Or Fail Closed?)
        // Usually Fail Open for MVP to avoid blocking users due to API errors, but log it.
        return {
            isSafe: true,
            score: 0,
            tags: [],
            error: error instanceof Error ? error.message : 'Unknown error',
            isMock: false,
        };
    }
}
