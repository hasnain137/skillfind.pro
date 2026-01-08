
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const result = await prisma.category.updateMany({
        where: {
            nameEn: 'English Tutor'
        },
        data: {
            icon: '🇬🇧'
        }
    });
    console.log('Updated categories:', result);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
