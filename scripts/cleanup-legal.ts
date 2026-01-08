
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Push Legal Services to the end and fix icon
    await prisma.category.updateMany({
        where: { nameEn: 'Legal Services' },
        data: {
            sortOrder: 90,
            icon: '⚖️'
        }
    });
    console.log('Moved Legal Services to end.');

    // Verify final top 8
    const top8 = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 8,
        select: { nameEn: true, sortOrder: true, icon: true }
    });
    console.log('Final Top 8:', top8);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
