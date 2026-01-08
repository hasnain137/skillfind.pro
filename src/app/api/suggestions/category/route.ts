// POST /api/suggestions/category - AI-powered category suggestion
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { BadRequestError } from '@/lib/errors';
import { getConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
    try {
        await requireClient(); // Ensure user is authenticated as client

        const body = await request.json();
        const { description } = body;

        if (!description || description.length < 10) {
            throw new BadRequestError('Description must be at least 10 characters');
        }

        // Get API key for suggestions
        const apiKey = await getConfig('OPENAI_SUGGESTION_API_KEY') || await getConfig('OPENAI_API_KEY');

        if (!apiKey) {
            // Fallback: return empty suggestion if no API key
            return successResponse({
                suggestion: null,
                message: 'AI suggestions not configured'
            });
        }

        // Fetch all active categories with subcategories
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            include: {
                subcategories: {
                    where: { isActive: true },
                    select: { id: true, nameEn: true }
                }
            },
            orderBy: { nameEn: 'asc' }
        });

        // Build category list for prompt
        const categoryList = categories.map(c =>
            `- ${c.nameEn} (ID: ${c.id}):\n  Subcategories: ${c.subcategories.map(s => `${s.nameEn} (ID: ${s.id})`).join(', ')}`
        ).join('\n');

        const systemPrompt = `You are a category classifier for SkillFind.pro, a platform connecting clients with professionals.

Given a job description, return the TOP 3 best matching categories and subcategories from the list below.
If there is only one clear match, return just one.
If the description is vague, provide reasonable alternatives.

Available categories and subcategories:
${categoryList}

IMPORTANT: Only return IDs that exist in the list above.

Respond in this exact JSON format (no markdown, no extra text):
{
  "suggestions": [
    { "categoryId": "actual_id_here", "subcategoryId": "actual_id_here", "confidence": 0.9, "reasoning": "Primary match" },
    { "categoryId": "actual_id_here", "subcategoryId": "actual_id_here", "confidence": 0.4, "reasoning": "Alternative option" }
  ]
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Job description: "${description}"` }
                ],
                temperature: 0.3,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI Suggestion API Error:', errorText);
            return successResponse({
                suggestions: [],
                message: 'AI suggestion failed'
            });
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content?.trim();

        if (!content) {
            return successResponse({
                suggestions: [],
                message: 'No suggestion generated'
            });
        }

        // Parse AI response
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (e) {
            // Try to extract JSON if wrapped in markdown
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                } catch (e2) {
                    console.error('Failed to parse AI response:', content);
                    return successResponse({ suggestions: [], message: 'Invalid AI response' });
                }
            } else {
                console.error('Failed to parse AI response:', content);
                return successResponse({ suggestions: [], message: 'Invalid AI response' });
            }
        }

        const rawSuggestions = parsed.suggestions || (parsed.categoryId ? [parsed] : []);

        // Validate and format suggestions
        const validSuggestions = rawSuggestions.map((s: any) => {
            const category = categories.find(c => c.id === s.categoryId);
            const subcategory = category?.subcategories.find(sub => sub.id === s.subcategoryId);

            if (!category || !subcategory) return null;

            return {
                category: {
                    id: category.id,
                    name: category.nameEn,
                },
                subcategory: {
                    id: subcategory.id,
                    name: subcategory.nameEn,
                },
                confidence: s.confidence || 0.5,
                reasoning: s.reasoning || '',
            };
        }).filter(Boolean); // Remove nulls

        return successResponse({
            suggestions: validSuggestions
        });

    } catch (error) {
        return handleApiError(error);
    }
}
