
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
    console.log('🧹 Starting Cleanup...');

    try {
        // Delete test clients
        const clients = await prisma.user.deleteMany({
            where: {
                email: {
                    startsWith: 'test-client-'
                }
            }
        });
        console.log(`✅ Deleted ${clients.count} test clients.`);

        // Delete test pros
        const pros = await prisma.user.deleteMany({
            where: {
                email: {
                    startsWith: 'test-pro-'
                }
            }
        });
        console.log(`✅ Deleted ${pros.count} test professionals.`);

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
