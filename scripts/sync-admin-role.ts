require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

const adminClerkId = 'user_36J318LFc0kfRMDssS4GXayB8us'; // hassnainnizamani880@gmail.com

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function syncAdminRole() {
    console.log(`🔄 PROMOTING Admin Role for: ${adminClerkId}...`);

    try {
        // 1. Update Clerk
        const response = await fetch(`https://api.clerk.com/v1/users/${adminClerkId}/metadata`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                public_metadata: {
                    role: 'ADMIN'
                }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(JSON.stringify(err));
        }

        const data = await response.json();
        console.log('✅ Clerk Metadata Promoted:', data.public_metadata);

        // 2. Update Database
        await prisma.user.update({
            where: { clerkId: adminClerkId },
            data: { role: 'ADMIN' }
        });
        console.log('✅ Database Role Promoted to ADMIN');
    } catch (error) {
        console.error('❌ Failed:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

syncAdminRole();
