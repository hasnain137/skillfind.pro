import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const categories = await prisma.category.findMany({
        where: {
            OR: [
                { nameEn: { contains: 'English', mode: 'insensitive' } },
                { nameFr: { contains: 'English', mode: 'insensitive' } },
                { slug: { contains: 'english', mode: 'insensitive' } }
            ]
        }
    });
    console.log('Categories with English:', categories);

    const allCategories = await prisma.category.findMany({
        select: { nameEn: true, icon: true, sortOrder: true }
    });
    console.log('All names and icons:', allCategories);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
