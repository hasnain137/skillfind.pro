
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
    console.error('❌ CLERK_SECRET_KEY is missing in .env');
    process.exit(1);
}

// Setup Prisma
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createClerkUser(email: string, firstName: string, lastName: string, password: string) {
    try {
        const response = await fetch('https://api.clerk.com/v1/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email_address: [email],
                password: password,
                first_name: firstName,
                last_name: lastName,
                skip_password_checks: true,
                skip_password_requirement: true
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // If user already exists, try to find them
            if (data.errors?.[0]?.code === 'form_identifier_exists') {
                console.log(`   ⚠️ User ${email} already exists in Clerk. Fetching details...`);
                const listRes = await fetch(`https://api.clerk.com/v1/users?email_address=${email}`, {
                    headers: { 'Authorization': `Bearer ${CLERK_SECRET_KEY}` }
                });
                const listData = await listRes.json();
                if (listData.length > 0) return listData[0];
            }
            throw new Error(JSON.stringify(data.errors || data));
        }

        return data;
    } catch (error) {
        console.error(`   ❌ Failed to create Clerk user ${email}:`, error);
        return null;
    }
}

async function main() {
    console.log('🔐 Creating Loginable Test Users...');

    // 1. Create Client User
    const clientEmail = 'test.client@skillfind.pro';
    const password = 'password123';

    console.log(`\n1️⃣ Processing Client: ${clientEmail}`);
    const clerkClient = await createClerkUser(clientEmail, 'Test', 'Client', password);

    if (clerkClient) {
        const dbClient = await prisma.user.upsert({
            where: { email: clientEmail },
            update: {},
            create: {
                email: clientEmail,
                clerkId: clerkClient.id,
                firstName: 'Test',
                lastName: 'Client',
                role: 'CLIENT',
                clientProfile: {
                    create: {
                        city: 'Paris',
                        country: 'FR'
                    }
                }
            }
        });
        console.log(`   ✅ Database Synced: ${dbClient.email} (Role: CLIENT)`);
        console.log(`   🔑 Login: ${clientEmail} / ${password}`);
    }

    // 2. Create Professional User
    const proEmail = 'test.pro@skillfind.pro';

    console.log(`\n2️⃣ Processing Professional: ${proEmail}`);
    const clerkPro = await createClerkUser(proEmail, 'Test', 'Pro', password);

    if (clerkPro) {
        const dbPro = await prisma.user.upsert({
            where: { email: proEmail },
            update: {},
            create: {
                email: proEmail,
                clerkId: clerkPro.id,
                firstName: 'Test',
                lastName: 'Pro',
                role: 'PROFESSIONAL',
                professionalProfile: {
                    create: {
                        status: 'ACTIVE',
                        isVerified: true,
                        businessName: 'Test Pro Services',
                        title: 'General Contractor',
                        bio: 'I am a test professional account.',
                        city: 'Lyon',
                        country: 'FR',
                        wallet: {
                            create: { balance: 5000 }
                        }
                    }
                }
            }
        });
        console.log(`   ✅ Database Synced: ${dbPro.email} (Role: PROFESSIONAL)`);
        console.log(`   🔑 Login: ${proEmail} / ${password}`);
    }

    console.log('\n✨ Done!');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
