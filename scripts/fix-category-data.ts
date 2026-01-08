
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🧹 Cleaning up categories...');

    // 1. Deactivate likely duplicates to avoid confusion
    const duplicatesToHide = [
        'Creative & Design', // vs Creative Services
        'Health & Wellness', // vs Wellness & Coaching
        'Home Services',     // vs Home Repair & Maintenance
        'Technical Help',    // vs Software & Tech
        'Academic Tutoring'  // vs Tutoring & Education
    ];

    await prisma.category.updateMany({
        where: { nameEn: { in: duplicatesToHide } },
        data: { isActive: false }
    });
    console.log(`Hidden ${duplicatesToHide.length} duplicate categories.`);

    // 2. Set Sort Orders for Top 8
    const topCategories = [
        { name: 'Home Repair & Maintenance', order: 1 },
        { name: 'Software & Tech', order: 2 },
        { name: 'Tutoring & Education', order: 3 },
        { name: 'Creative Services', order: 4 },
        { name: 'Wellness & Coaching', order: 5 },
        { name: 'Business Support', order: 6 },
        { name: 'English Tutor', order: 7 },
        { name: 'Writing & Translation', order: 8 } // Replacing Legal Services if it's boring, or keeping Legal? Let's use Writing.
    ];

    for (const cat of topCategories) {
        await prisma.category.updateMany({
            where: { nameEn: cat.name },
            data: { sortOrder: cat.order, isActive: true }
        });
    }

    console.log('✅ Updated sort orders for top 8 categories.');

    // Verify
    const active = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { nameEn: true, sortOrder: true }
    });
    console.log('Active Categories:', active);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
