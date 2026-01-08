
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 15) ?? 'UNDEFINED');

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.count();
    const clients = await prisma.client.count();
    const professionals = await prisma.professional.count();
    const requests = await prisma.request.count();
    const offers = await prisma.offer.count();

    console.log('--- Migration Verification ---');
    console.log(`Users: ${users}`);
    console.log(`Clients: ${clients}`);
    console.log(`Professionals: ${professionals}`);
    console.log(`Requests: ${requests}`);
    console.log(`Offers: ${offers}`);
    console.log('------------------------------');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
