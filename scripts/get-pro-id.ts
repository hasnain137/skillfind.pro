
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const pro = await prisma.professional.findFirst();
    if (pro) {
        console.log(`PRO_ID=${pro.id}`);
    } else {
        console.log('No professionals found');
    }
    await prisma.$disconnect();
}

main().catch(console.error);
