
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { flattenObject } from '@/lib/utils';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        console.log('[Seed API] Starting seed process...');
        await requireAdmin();

        // Use FS to read file instead of import
        const filePath = path.join(process.cwd(), 'messages', 'en.json');
        console.log('[Seed API] Reading file from:', filePath);

        if (!fs.existsSync(filePath)) {
            console.error('[Seed API] File not found at:', filePath);
            return NextResponse.json({ error: 'Source file not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const enMessages = JSON.parse(fileContent);

        const flatEn = flattenObject(enMessages);

        // Prepare data for bulk insert
        const records = Object.entries(flatEn).map(([key, value]) => ({
            key,
            value: String(value),
            locale: 'en',
            namespace: 'common' // Default namespace
        }));

        console.log(`[Seed API] Found ${records.length} keys to seed.`);

        // Batch insert with skipDuplicates
        const result = await prisma.translation.createMany({
            data: records,
            skipDuplicates: true,
        });

        console.log(`[Seed API] Successfully seeded ${result.count} new translations.`);

        return successResponse({
            count: result.count,
            message: `Seeded ${result.count} new translation keys.`
        });
    } catch (error: any) {
        console.error('[Seed API] Critical Error:', error);
        return NextResponse.json({
            error: 'Seed Failed',
            details: error.message,
            stack: error.stack,
            path: path.join(process.cwd(), 'messages', 'en.json') // Debug path
        }, { status: 500 });
    }
}
