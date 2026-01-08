// POST /api/admin/translations/publish - Generate JSON files from DB translations
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import fs from 'fs';
import path from 'path';

// Helper to unflatten keys like "Landing.Hero.title" -> { Landing: { Hero: { title: "..." } } }
function unflattenMessages(flatMessages: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(flatMessages)) {
        const parts = key.split('.');
        let current = result;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i === parts.length - 1) {
                current[part] = value;
            } else {
                current[part] = current[part] || {};
                current = current[part];
            }
        }
    }

    return result;
}

// Helper to deep merge objects
function deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }

    return result;
}

export async function POST() {
    try {
        // Require admin authentication
        await requireAdmin();

        const locales = ['en', 'fr'];
        const messagesDir = path.join(process.cwd(), 'messages');
        const results: Record<string, { updated: number; total: number }> = {};

        for (const locale of locales) {
            // 1. Load existing file-based translations
            const filePath = path.join(messagesDir, `${locale}.json`);
            let fileMessages: Record<string, any> = {};

            try {
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    fileMessages = JSON.parse(fileContent);
                }
            } catch (e) {
                console.error(`Failed to read ${locale}.json:`, e);
            }

            // 2. Fetch DB translations for this locale
            const dbTranslations = await prisma.translation.findMany({
                where: { locale }
            });

            // 3. Convert DB translations to nested format
            const flatDbMessages: Record<string, string> = {};
            for (const t of dbTranslations) {
                flatDbMessages[t.key] = t.value;
            }
            const nestedDbMessages = unflattenMessages(flatDbMessages);

            // 4. Merge: DB overwrites file
            const mergedMessages = deepMerge(fileMessages, nestedDbMessages);

            // 5. Write back to file
            fs.writeFileSync(
                filePath,
                JSON.stringify(mergedMessages, null, 2),
                'utf-8'
            );

            results[locale] = {
                updated: dbTranslations.length,
                total: Object.keys(flatDbMessages).length
            };
        }

        return NextResponse.json({
            success: true,
            message: 'Translations published successfully! Changes will be live on next deployment or server restart.',
            results
        });

    } catch (error) {
        console.error('Publish translations error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to publish translations' },
            { status: 500 }
        );
    }
}
