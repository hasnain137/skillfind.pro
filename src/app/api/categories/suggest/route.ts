
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text || text.length < 5) {
            return NextResponse.json({ suggested: null });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            // Graceful degradation: If no key, just return no suggestion
            return NextResponse.json({ suggested: null });
        }

        // 1. Fetch available categories for the prompt context
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            select: {
                id: true,
                nameEn: true,
                subcategories: {
                    where: { isActive: true },
                    select: { id: true, nameEn: true }
                }
            }
        });

        // 2. Format context for AI
        const taxonomy = categories.map(c => ({
            category: c.nameEn,
            subcategories: c.subcategories.map(s => s.nameEn).join(', ')
        })).map(c => `- ${c.category}: [${c.subcategories}]`).join('\n');

        const SYSTEM_PROMPT = `You are a helpful classification assistant for a service marketplace.
Your goal is to map the user's request description to the most relevant Category and Subcategory from the provided list.

AVAILABLE CATEGORIES:
${taxonomy}

INSTRUCTIONS:
1. Analyze the user text.
2. Find the best matching Category and Subcategory.
3. Return a JSON object ONLY: { "categoryName": "...", "subcategoryName": "..." }
4. If no good match is found, return null.`;

        // 3. Call OpenAI
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
                    { role: 'user', content: text }
                ],
                temperature: 0.3, // Low temp for consistent classification
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            console.error('OpenAI Suggestion Error:', await response.text());
            return NextResponse.json({ suggested: null });
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        if (!result || !result.categoryName || !result.subcategoryName) {
            return NextResponse.json({ suggested: null });
        }

        // 4. Map back to IDs
        const matchedCategory = categories.find(c => c.nameEn.toLowerCase() === result.categoryName.toLowerCase());
        if (!matchedCategory) return NextResponse.json({ suggested: null });

        const matchedSubcategory = matchedCategory.subcategories.find(s => s.nameEn.toLowerCase() === result.subcategoryName.toLowerCase());
        if (!matchedSubcategory) return NextResponse.json({ suggested: null });

        return NextResponse.json({
            suggested: {
                categoryId: matchedCategory.id,
                subcategoryId: matchedSubcategory.id,
                categoryName: matchedCategory.nameEn,
                subcategoryName: matchedSubcategory.nameEn
            }
        });

    } catch (error) {
        console.error('Category Suggestion Error:', error);
        return NextResponse.json({ suggested: null });
    }
}
