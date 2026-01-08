
import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';

// Initialize standalone client
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    console.log('Finding professionals...');
    const pros = await prisma.professional.findMany({
        include: {
            user: true,
            wallet: true,
        },
        take: 1
    });

    if (pros.length === 0) {
        console.log('No professionals found.');
        return;
    }

    const pro = pros[0];
    console.log(`Found pro: ${pro.user.firstName} ${pro.user.lastName}`);
    console.log(`Current Balance: €${((pro.wallet?.balance || 0) / 100).toFixed(2)}`);

    if ((pro.wallet?.balance || 0) < 5000) {
        console.log('Crediting wallet with €50.00...');

        const wallet = await prisma.wallet.upsert({
            where: { professionalId: pro.id },
            create: { professionalId: pro.id, balance: 5000 },
            update: { balance: { increment: 5000 } }
        });

        console.log(`New Balance: €${(wallet.balance / 100).toFixed(2)}`);
    } else {
        console.log('Balance is sufficient.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
