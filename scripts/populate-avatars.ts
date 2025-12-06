
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Setup Prisma
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🖼️  Populating avatars...');

    try {
        // Fetch all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                avatar: true,
            }
        });

        console.log(`Found ${users.length} users.`);

        let updatedCount = 0;

        for (const user of users) {
            // Generate a random avatar URL
            // Using men/women randomly and a random index 0-99
            const gender = Math.random() > 0.5 ? 'men' : 'women';
            const index = Math.floor(Math.random() * 100);
            const avatarUrl = `https://randomuser.me/api/portraits/${gender}/${index}.jpg`;

            // Update user
            await prisma.user.update({
                where: { id: user.id },
                data: { avatar: avatarUrl }
            });
            updatedCount++;
            process.stdout.write('.'); // Progress indicator
        }

        console.log(`\n✅ Updated avatars for ${updatedCount} users.`);

    } catch (error) {
        console.error('❌ Failed to populate avatars:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
