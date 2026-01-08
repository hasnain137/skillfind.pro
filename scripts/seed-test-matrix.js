require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding Test Matrix...');

    // --- 1. Clients ---
    const clients = [
        {
            email: 'client.verified@test.com',
            clerkId: 'test_client_verified',
            firstName: 'Client',
            lastName: 'Verified',
            isVerified: true,
            isBanned: false,
        },
        {
            email: 'client.unverified@test.com',
            clerkId: 'test_client_unverified',
            firstName: 'Client',
            lastName: 'Unverified',
            isVerified: false,
            isBanned: false,
        },
        {
            email: 'client.banned@test.com',
            clerkId: 'test_client_banned',
            firstName: 'Client',
            lastName: 'Banned',
            isVerified: true,
            isBanned: true,
        },
    ];

    for (const c of clients) {
        await prisma.user.upsert({
            where: { clerkId: c.clerkId },
            update: {
                email: c.email,
                firstName: c.firstName,
                lastName: c.lastName,
                emailVerified: c.isVerified,
                phoneVerified: c.isVerified,
                isBanned: c.isBanned,
            },
            create: {
                email: c.email,
                clerkId: c.clerkId,
                firstName: c.firstName,
                lastName: c.lastName,
                emailVerified: c.isVerified,
                phoneVerified: c.isVerified,
                isBanned: c.isBanned,
                role: 'CLIENT',
                clientProfile: {
                    create: {
                        country: 'FR',
                        city: 'Paris',
                    },
                },
            },
        });
    }

    // --- 2. Professionals ---
    const pros = [
        {
            email: 'pro.active@test.com',
            clerkId: 'test_pro_active',
            firstName: 'Pro',
            lastName: 'Active',
            status: 'ACTIVE',
            walletBalance: 5000, // €50.00
        },
        {
            email: 'pro.pending@test.com',
            clerkId: 'test_pro_pending',
            firstName: 'Pro',
            lastName: 'Pending',
            status: 'PENDING_REVIEW',
            walletBalance: 0,
        },
        {
            email: 'pro.suspended@test.com',
            clerkId: 'test_pro_suspended',
            firstName: 'Pro',
            lastName: 'Suspended',
            status: 'SUSPENDED',
            walletBalance: 1000,
        },
        {
            email: 'pro.banned@test.com',
            clerkId: 'test_pro_banned',
            firstName: 'Pro',
            lastName: 'Banned',
            status: 'BANNED',
            walletBalance: 0,
        },
        {
            email: 'pro.incomplete@test.com',
            clerkId: 'test_pro_incomplete',
            firstName: 'Pro',
            lastName: 'Incomplete',
            status: 'INCOMPLETE',
            walletBalance: 0,
        },
        {
            email: 'pro.broke@test.com',
            clerkId: 'test_pro_broke',
            firstName: 'Pro',
            lastName: 'Broke',
            status: 'ACTIVE',
            walletBalance: 0, // €0.00
        },
    ];

    // Get a category for services
    const category = await prisma.category.findFirst({ include: { subcategories: true } });
    var subcategory;
    if (!category || category.subcategories.length === 0) {
        // Try to create one if missing
        console.log('No categories found. Creating fallback category...');
        const newCat = await prisma.category.create({
            data: {
                slug: 'test-category',
                nameEn: 'Test Category',
                subcategories: {
                    create: {
                        slug: 'test-subcategory',
                        nameEn: 'Test Subcategory',
                    }
                }
            },
            include: { subcategories: true }
        });
        // Use the newly created one
        subcategory = newCat.subcategories[0];
    } else {
        subcategory = category.subcategories[0];
    }

    for (const p of pros) {
        const user = await prisma.user.upsert({
            where: { clerkId: p.clerkId },
            update: {
                email: p.email,
                firstName: p.firstName,
                lastName: p.lastName,
                emailVerified: true,
                phoneVerified: true,
            },
            create: {
                email: p.email,
                clerkId: p.clerkId,
                firstName: p.firstName,
                lastName: p.lastName,
                emailVerified: true,
                phoneVerified: true,
                role: 'PROFESSIONAL',
            },
        });

        const pro = await prisma.professional.upsert({
            where: { userId: user.id },
            update: {
                status: p.status,
                isVerified: p.status === 'ACTIVE' || p.status === 'SUSPENDED' || p.status === 'BANNED',
                city: 'Paris',
                country: 'FR',
                bio: 'I am a test professional with a bio longer than 50 characters to meet requirements.',
            },
            create: {
                userId: user.id,
                status: p.status,
                isVerified: p.status === 'ACTIVE' || p.status === 'SUSPENDED' || p.status === 'BANNED',
                city: 'Paris',
                country: 'FR',
                bio: 'I am a test professional with a bio longer than 50 characters to meet requirements.',
                profileCompletion: 100,
            },
        });

        // Ensure wallet
        await prisma.wallet.upsert({
            where: { professionalId: pro.id },
            update: { balance: p.walletBalance },
            create: {
                professionalId: pro.id,
                balance: p.walletBalance,
            },
        });

        // Ensure service (except for incomplete pro)
        if (p.status !== 'INCOMPLETE') {
            const serviceExists = await prisma.professionalService.findFirst({
                where: { professionalId: pro.id, subcategoryId: subcategory.id },
            });

            if (!serviceExists) {
                await prisma.professionalService.create({
                    data: {
                        professionalId: pro.id,
                        subcategoryId: subcategory.id,
                        priceFrom: 50,
                        description: 'Test Service',
                    },
                });
            }
        }
    }

    console.log('✅ Test Matrix Seeded Successfully!');
    console.log('Clients:', clients.map(c => c.email).join(', '));
    console.log('Pros:', pros.map(p => p.email).join(', '));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
