
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Setup Prisma with Adapter (same as app)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🚀 Starting Core Flow Verification...');

    try {
        // 1. Setup Test Data
        console.log('\n--- 1. Setting up Test Data ---');
        const testEmailClient = `test-client-${Date.now()}@example.com`;
        const testEmailPro = `test-pro-${Date.now()}@example.com`;

        // Create Client
        const clientUser = await prisma.user.create({
            data: {
                email: testEmailClient,
                clerkId: `clerk_client_${Date.now()}`,
                firstName: 'Test',
                lastName: 'Client',
                role: 'CLIENT',
                clientProfile: { create: {} }
            },
            include: { clientProfile: true }
        });
        console.log('✅ Created Client:', clientUser.email);

        // Create Professional
        const proUser = await prisma.user.create({
            data: {
                email: testEmailPro,
                clerkId: `clerk_pro_${Date.now()}`,
                firstName: 'Test',
                lastName: 'Pro',
                role: 'PROFESSIONAL',
                professionalProfile: {
                    create: {
                        status: 'ACTIVE',
                        isVerified: true,
                        wallet: {
                            create: {
                                balance: 500, // €5.00 start balance
                                totalSpent: 0
                            }
                        }
                    }
                }
            },
            include: { professionalProfile: { include: { wallet: true } } }
        });
        console.log('✅ Created Professional:', proUser.email);

        // 2. Request Flow
        console.log('\n--- 2. Request Flow ---');
        // Get a category and subcategory
        const category = await prisma.category.findFirst({
            include: { subcategories: true }
        });

        if (!category || category.subcategories.length === 0) {
            throw new Error('No categories/subcategories found. Run seed first.');
        }
        const subcategory = category.subcategories[0];

        const request = await prisma.request.create({
            data: {
                clientId: clientUser.clientProfile!.id,
                categoryId: category.id,
                subcategoryId: subcategory.id,
                title: 'Test Request',
                description: 'This is a test request for verification.',
                locationType: 'REMOTE',
                status: 'OPEN'
            }
        });
        console.log('✅ Client posted request:', request.id);

        // 3. Offer Flow
        console.log('\n--- 3. Offer Flow ---');
        // Check wallet balance before offer (should be > 200)
        if (proUser.professionalProfile!.wallet!.balance < 200) {
            throw new Error('Pro wallet balance too low for test');
        }

        const offer = await prisma.offer.create({
            data: {
                requestId: request.id,
                professionalId: proUser.professionalProfile!.id,
                proposedPrice: 10000, // €100 (renamed from price)
                message: 'I can do this job.',
                status: 'PENDING'
            }
        });
        console.log('✅ Professional submitted offer:', offer.id);

        // 4. Billing Flow (PPC)
        console.log('\n--- 4. Billing Flow (PPC) ---');
        const CLICK_FEE = 10; // 10 cents
        const balanceBefore = proUser.professionalProfile!.wallet!.balance;

        // Simulate Click
        await prisma.$transaction(async (tx) => {
            // Deduct from wallet
            await tx.wallet.update({
                where: { professionalId: proUser.professionalProfile!.id },
                data: {
                    balance: { decrement: CLICK_FEE },
                    totalSpent: { increment: CLICK_FEE }
                }
            });

            // Create Transaction
            await tx.transaction.create({
                data: {
                    walletId: proUser.professionalProfile!.wallet!.id,
                    type: 'DEBIT',
                    amount: CLICK_FEE,
                    balanceBefore: balanceBefore,
                    balanceAfter: balanceBefore - CLICK_FEE,
                    description: 'Profile view fee'
                }
            });

            // Record Click Event
            await tx.clickEvent.create({
                data: {
                    offerId: offer.id,
                    professionalId: proUser.professionalProfile!.id,
                    clientId: clientUser.clientProfile!.id,
                    // cost field removed as it's not in schema
                }
            });
        });

        // Verify Wallet Balance
        const updatedWallet = await prisma.wallet.findUnique({
            where: { professionalId: proUser.professionalProfile!.id }
        });

        if (updatedWallet!.balance === 490) {
            console.log('✅ Wallet deduction verified: 500 -> 490');
        } else {
            throw new Error(`Wallet deduction failed. Expected 490, got ${updatedWallet!.balance}`);
        }

        // 5. Acceptance Flow
        console.log('\n--- 5. Acceptance Flow ---');
        await prisma.$transaction(async (tx) => {
            // Update Offer
            await tx.offer.update({
                where: { id: offer.id },
                data: { status: 'ACCEPTED' }
            });

            // Update Request
            await tx.request.update({
                where: { id: request.id },
                data: { status: 'IN_PROGRESS' }
            });

            // Create Job
            await tx.job.create({
                data: {
                    requestId: request.id,
                    professionalId: proUser.professionalProfile!.id,
                    clientId: clientUser.clientProfile!.id,
                    agreedPrice: offer.proposedPrice, // Renamed from price
                    status: 'IN_PROGRESS'
                }
            });
        });

        const job = await prisma.job.findFirst({
            where: { requestId: request.id }
        });

        if (job) {
            console.log('✅ Job created successfully:', job.id);
        } else {
            throw new Error('Job creation failed');
        }

        console.log('\n🎉 ALL CORE FLOWS VERIFIED SUCCESSFULLY!');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
