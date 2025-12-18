// Quick backup script for Translation table
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function backupTranslations() {
    const prisma = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL
    });

    try {
        console.log('Fetching translations...');
        const translations = await prisma.translation.findMany();

        const backupPath = './translations-backup.json';
        fs.writeFileSync(backupPath, JSON.stringify(translations, null, 2));

        console.log(`✅ Backed up ${translations.length} translations to ${backupPath}`);
    } catch (error) {
        console.error('Error backing up:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

backupTranslations();
