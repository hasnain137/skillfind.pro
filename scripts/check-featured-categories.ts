
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
            user: {
                email: {
                    in: ['featured.dev@example.com', 'featured.design@example.com', 'featured.tutor@example.com']
                }
            }
        },
        include: {
            user: { select: { firstName: true, lastName: true } },
            services: {
                include: {
                    subcategory: {
                        include: {
                            category: true
                        }
                    }
                }
            }
        }
    });

    console.log('--- Featured Professionals Data ---');
    for (const pro of pros) {
        const service = pro.services[0];
        console.log(`\nName: ${pro.user.firstName} ${pro.user.lastName}`);
        console.log(`Service: ${service?.description}`);
        console.log(`Subcategory: ${service?.subcategory?.nameEn}`);
        console.log(`Parent Category: ${service?.subcategory?.category?.nameEn}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
