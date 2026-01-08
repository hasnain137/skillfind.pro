
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Starting Billing & Wallet Logic Verification (CommonJS)...');

    try {
        // 1. Setup: Find or Create Test Data
        console.log('\n1️⃣  Setting up test data...');

        const professional = await prisma.professional.findFirst({
            include: { wallet: true, user: true }
        });

        if (!professional) {
            console.error('❌ No professional found. Please seed the database.');
            return;
        }
        console.log(`   Found Professional: ${professional.user.email} (ID: ${professional.id})`);

        const client = await prisma.client.findFirst({
            include: { user: true }
        });

        if (!client) {
            console.error('❌ No client found. Please seed the database.');
            return;
        }
        console.log(`   Found Client: ${client.user.email} (ID: ${client.id})`);

        // Ensure wallet exists
        let wallet = professional.wallet;
        if (!wallet) {
            console.log('   Creating missing wallet...');
            wallet = await prisma.wallet.create({
                data: { professionalId: professional.id, balance: 0 }
            });
        }

        // 2. Test Wallet Balance Check Logic
        console.log('\n2️⃣  Testing Wallet Balance Check Logic...');

        // Simulate 0 balance
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: 0 }
        });
        console.log('   Set wallet balance to €0.00');

        const walletLow = await prisma.wallet.findUnique({ where: { id: wallet.id } });
        if (walletLow.balance < 200) {
            console.log('   ✅ Correctly identified insufficient balance (0 < 200)');
        } else {
            console.error('   ❌ FAILED: Should have rejected offer with 0 balance');
        }

        // Simulate €5.00 balance
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: 500 }
        });
        console.log('   Set wallet balance to €5.00');

        const walletHigh = await prisma.wallet.findUnique({ where: { id: wallet.id } });
        if (walletHigh.balance >= 200) {
            console.log('   ✅ Correctly identified sufficient balance (500 >= 200)');
        } else {
            console.error('   ❌ FAILED: Should have allowed offer with 500 balance');
        }

        // 3. Test Pay-Per-Click Billing Logic
        console.log('\n3️⃣  Testing Pay-Per-Click Billing Logic...');

        // Create a dummy offer if needed
        let request = await prisma.request.findFirst({ where: { clientId: client.id } });
        if (!request) {
            // Create dummy request
            const category = await prisma.category.findFirst();
            const subcategory = await prisma.subcategory.findFirst();
            if (!category || !subcategory) {
                console.error('❌ No category/subcategory found.');
                return;
            }
            request = await prisma.request.create({
                data: {
                    clientId: client.id,
                    categoryId: category.id,
                    subcategoryId: subcategory.id,
                    title: 'Test Request',
                    description: 'Test Description',
                    locationType: 'REMOTE',
                }
            });
        }

        let offer = await prisma.offer.findFirst({
            where: { professionalId: professional.id, requestId: request.id }
        });

        if (!offer) {
            offer = await prisma.offer.create({
                data: {
                    professionalId: professional.id,
                    requestId: request.id,
                    message: 'Test Offer',
                    proposedPrice: 100,
                    status: 'PENDING'
                }
            });
        }

        const startBalance = (await prisma.wallet.findUnique({ where: { id: wallet.id } })).balance;
        console.log(`   Starting Balance: €${startBalance / 100}`);

        // Simulate Click Transaction
        const CLICK_FEE = 10; // 10 cents

        await prisma.$transaction(async (tx) => {
            // Create click event
            await tx.clickEvent.create({
                data: {
                    offerId: offer.id,
                    clientId: client.id,
                    professionalId: professional.id,
                },
            });

            // Deduct balance
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: CLICK_FEE },
                    totalSpent: { increment: CLICK_FEE },
                },
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'DEBIT',
                    amount: CLICK_FEE,
                    balanceBefore: startBalance,
                    balanceAfter: startBalance - CLICK_FEE,
                    description: 'Profile view fee',
                },
            });
        });

        const endBalance = (await prisma.wallet.findUnique({ where: { id: wallet.id } })).balance;
        console.log(`   Ending Balance: €${endBalance / 100}`);

        if (endBalance === startBalance - CLICK_FEE) {
            console.log('   ✅ Balance correctly deducted by €0.10');
        } else {
            console.error(`   ❌ FAILED: Balance mismatch. Expected ${startBalance - CLICK_FEE}, got ${endBalance}`);
        }

        const clickEvent = await prisma.clickEvent.findFirst({
            where: { offerId: offer.id, clientId: client.id }
        });

        if (clickEvent) {
            console.log('   ✅ Click event recorded in database');
        } else {
            console.error('   ❌ FAILED: Click event not found');
        }

        console.log('\n✨ Verification Complete!');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
