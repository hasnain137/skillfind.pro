
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import fs from 'fs';
import path from 'path';

// Helper to flatten nested object
function flattenMessages(nestedMessages: any, prefix = ""): Record<string, string> {
    let flattened: Record<string, string> = {};
    for (let key in nestedMessages) {
        if (typeof nestedMessages[key] === 'string') {
            flattened[`${prefix}${key}`] = nestedMessages[key];
        } else {
            Object.assign(flattened, flattenMessages(nestedMessages[key], `${prefix}${key}.`));
        }
    }
    return flattened;
}

// Helper to safely load JSON messages
function loadMessages(locale: string) {
    try {
        const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(fileContent);
        }
    } catch (e) {
        console.error(`Failed to load messages for ${locale}:`, e);
    }
    return null;
}

export async function GET(req: NextRequest) {
    try {


        // 1. Fetch all DB translations
        const dbTranslations = await prisma.translation.findMany();


        // 2. Load file-based defaults
        const fileTranslations: any[] = [];
        const enMessages = loadMessages('en');
        const frMessages = loadMessages('fr');

        // Helper to process file messages
        const processFileMessages = (messages: any, locale: string) => {
            try {
                const flat = flattenMessages(messages);
                Object.keys(flat).forEach(key => {
                    const namespace = key.split('.')[0] || "Common";
                    fileTranslations.push({
                        key,
                        locale,
                        value: flat[key],
                        namespace
                    });
                });
            } catch (err) {
                console.error(`Error processing ${locale} messages:`, err);
            }
        };

        if (enMessages) processFileMessages(enMessages, "en");
        if (frMessages) processFileMessages(frMessages, "fr");

        // 3. Merge
        const dbMap = new Map(dbTranslations.map((t: any) => [`${t.key}:${t.locale}`, t]));
        const combinedTranslations = [...dbTranslations];

        fileTranslations.forEach(ft => {
            if (!dbMap.has(`${ft.key}:${ft.locale}`)) {
                combinedTranslations.push(ft);
            }
        });


        return NextResponse.json({ translations: combinedTranslations });
    } catch (error) {
        console.error("Admin Translations API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { key, locale, value, namespace } = body;

        if (!key || !locale || !namespace) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const translation = await prisma.translation.upsert({
            where: {
                key_locale: {
                    key,
                    locale
                }
            },
            update: {
                value,
                namespace,
            },
            create: {
                key,
                locale,
                value,
                namespace
            }
        });

        revalidatePath('/[locale]/admin/translations', 'page');

        return NextResponse.json({ success: true, translation });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
