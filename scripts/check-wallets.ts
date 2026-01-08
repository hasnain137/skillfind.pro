import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';

console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
const prisma = new PrismaClient();

async function main() {
    const pros = await prisma.professional.findMany({
        include: {
            user: true,
            wallet: true,
        },
    });

    console.log('--- Professional Wallets ---');
    pros.forEach(p => {
        console.log(`Pro: ${p.user.firstName} ${p.user.lastName} (${p.user.email})`);
        console.log(`Status: ${p.status}, Verified: ${p.isVerified}`);
        console.log(`Wallet Balance: €${((p.wallet?.balance || 0) / 100).toFixed(2)}`);
        console.log('----------------------------');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
