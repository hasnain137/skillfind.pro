import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const badTranslations = await prisma.translation.findMany({
        where: {
            value: {
                contains: '[FR]'
            }
        }
    });

    console.log(`Found ${badTranslations.length} translations with [FR] prefix.`);

    if (badTranslations.length > 0) {
        console.log('Sample bad translations:');
        badTranslations.slice(0, 5).forEach(t => console.log(`${t.key} (${t.locale}): ${t.value}`));

        // Optional: Clean them up?
        // Let's just report for now.
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
