
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
    console.log('🌱 Seeding Test Users...');

    try {
        // 1. Create Verified Professional (Plumber)
        const plumberEmail = `pro-plumber-${Date.now()}@test.com`;
        const plumber = await prisma.user.create({
            data: {
                email: plumberEmail,
                clerkId: `fake_clerk_pro_plumber_${Date.now()}`,
                firstName: 'Mario',
                lastName: 'Rossi',
                role: 'PROFESSIONAL',
                professionalProfile: {
                    create: {
                        status: 'ACTIVE',
                        isVerified: true,
                        businessName: 'Super Mario Plumbing',
                        title: 'Expert Plumber',
                        bio: 'I have 20 years of experience fixing pipes and saving princesses.',
                        city: 'Paris',
                        country: 'FR',
                        wallet: {
                            create: {
                                balance: 5000, // €50.00
                            }
                        }
                    }
                }
            },
            include: { professionalProfile: true }
        });
        console.log(`✅ Created Verified Pro: ${plumber.firstName} ${plumber.lastName} (${plumber.email})`);

        // Add Service to Plumber
        const plumbingSub = await prisma.subcategory.findFirst({ where: { slug: 'plumbing' } });
        if (plumbingSub) {
            await prisma.professionalService.create({
                data: {
                    professionalId: plumber.professionalProfile!.id,
                    subcategoryId: plumbingSub.id,
                    description: 'Leak repair, pipe installation, and more.',
                    priceFrom: 50,
                    priceTo: 150
                }
            });
            console.log(`   -> Added Service: Plumbing`);
        }

        // 2. Create Unverified Professional (Web Dev)
        const devEmail = `pro-dev-${Date.now()}@test.com`;
        const dev = await prisma.user.create({
            data: {
                email: devEmail,
                clerkId: `fake_clerk_pro_dev_${Date.now()}`,
                firstName: 'Luigi',
                lastName: 'Verdi',
                role: 'PROFESSIONAL',
                professionalProfile: {
                    create: {
                        status: 'PENDING_REVIEW',
                        isVerified: false,
                        businessName: 'Luigi Web Solutions',
                        title: 'Full Stack Developer',
                        bio: 'Building modern websites with Next.js.',
                        city: 'Lyon',
                        country: 'FR',
                        wallet: {
                            create: {
                                balance: 0,
                            }
                        }
                    }
                }
            }
        });
        console.log(`✅ Created Unverified Pro: ${dev.firstName} ${dev.lastName} (${dev.email})`);

        // 3. Create Client
        const clientEmail = `client-${Date.now()}@test.com`;
        const client = await prisma.user.create({
            data: {
                email: clientEmail,
                clerkId: `fake_clerk_client_${Date.now()}`,
                firstName: 'Princess',
                lastName: 'Peach',
                role: 'CLIENT',
                clientProfile: {
                    create: {
                        city: 'Paris',
                        country: 'FR'
                    }
                }
            },
            include: { clientProfile: true }
        });
        console.log(`✅ Created Client: ${client.firstName} ${client.lastName} (${client.email})`);

        // 4. Create a Request from Client
        if (plumbingSub) {
            const request = await prisma.request.create({
                data: {
                    clientId: client.clientProfile!.id,
                    categoryId: plumbingSub.categoryId,
                    subcategoryId: plumbingSub.id,
                    title: 'Leaky Faucet in Kitchen',
                    description: 'My kitchen faucet is dripping constantly. Need help ASAP.',
                    locationType: 'ON_SITE',
                    city: 'Paris',
                    status: 'OPEN'
                }
            });
            console.log(`✅ Created Request: "${request.title}" by ${client.firstName}`);
        }

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
