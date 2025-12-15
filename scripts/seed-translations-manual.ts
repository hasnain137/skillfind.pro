import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

console.log('DB URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter,
    log: ['info', 'warn', 'error']
});

function flattenObject(obj: any, prefix = '') {
    return Object.keys(obj).reduce((acc: any, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
}

async function seedLocale(locale: string) {
    const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
    console.log(`[Seed] Reading ${locale} file from:`, filePath);

    if (!fs.existsSync(filePath)) {
        console.warn(`[Seed] File not found for locale: ${locale}. Skipping.`);
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const messages = JSON.parse(fileContent);

    const flatMessages = flattenObject(messages);

    // Prepare data for bulk insert
    const records = Object.entries(flatMessages).map(([key, value]) => ({
        key,
        value: String(value),
        locale,
        namespace: 'common' // Default namespace for all
    }));

    console.log(`[Seed] Found ${records.length} keys to seed for ${locale}.`);

    // Batch insert with skipDuplicates doesn't update, so we need to loop for upsert
    // or delete and recreate. Since this is a manual seed, let's use upsert.
    console.log(`[Seed] Upserting ${records.length} keys for ${locale}...`);

    let updatedCount = 0;
    for (const record of records) {
        await prisma.translation.upsert({
            where: {
                key_locale: {
                    key: record.key,
                    locale: record.locale
                }
            },
            update: {
                value: record.value,
                namespace: record.namespace // Also update namespace if it changes
            },
            create: {
                key: record.key,
                value: record.value,
                locale: record.locale,
                namespace: record.namespace
            }
        });
        updatedCount++;
    }

    console.log(`[Seed] Successfully processed ${updatedCount} translations for ${locale}.`);
}

async function main() {
    try {
        await seedLocale('en');
        await seedLocale('fr');
    } catch (error) {
        console.error('[Seed] Critical Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
