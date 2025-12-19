
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const pros = await prisma.professional.findMany({
        where: {
            status: 'ACTIVE',
            averageRating: {
                gt: 0,
            },
            user: {
                email: {
                    in: ['featured.dev@example.com', 'featured.design@example.com', 'featured.tutor@example.com']
                }
            }
        },
        select: {
            id: true,
            status: true,
            averageRating: true,
            user: { select: { firstName: true, lastName: true } }
        }
    });

    console.log('Found featured professionals:', pros);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
