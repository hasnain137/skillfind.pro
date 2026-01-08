
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const total = await prisma.user.count();
    const withAvatar = await prisma.user.count({
        where: { avatar: { not: null } }
    });

    console.log(`Total users: ${total}`);
    console.log(`Users with avatars: ${withAvatar}`);

    if (withAvatar > 0) {
        const sample = await prisma.user.findFirst({
            where: { avatar: { not: null } },
            select: { email: true, role: true, avatar: true }
        });
        console.log('Sample user:', sample);
    }

    await prisma.$disconnect();
    await pool.end();
}

main();
