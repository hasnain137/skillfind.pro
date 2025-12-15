import 'dotenv/config';
import { Client } from 'pg';

async function main() {
    console.log('Starting emergency migration via PG...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Supabase usually needs this or handles it via URL
    });

    try {
        await client.connect();
        console.log('Connected to DB.');

        // 1. Create SystemSetting
        console.log('Creating SystemSetting table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS "SystemSetting" (
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
      );
    `);
        console.log('SystemSetting table created/verified.');

        // 2. Create Translation
        console.log('Creating Translation table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS "Translation" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "locale" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "namespace" TEXT NOT NULL DEFAULT 'common',
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
      );
    `);

        // Indices
        await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "Translation_key_locale_key" ON "Translation"("key", "locale");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "Translation_locale_namespace_idx" ON "Translation"("locale", "namespace");`);

        console.log('Translation table created/verified.');
        console.log('Emergency migration success!');

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await client.end();
    }
}

main();
