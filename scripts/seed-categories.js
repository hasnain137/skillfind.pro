require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
    {
        nameEn: 'Academic Tutoring',
        nameFr: 'Soutien Scolaire',
        slug: 'academic-tutoring',
        icon: '📚',
        description: 'Expert help for school and university studies.',
        sortOrder: 100,
    },
    {
        nameEn: 'Technical Help',
        nameFr: 'Aide Technique',
        slug: 'technical-help',
        icon: '💻',
        description: 'Support for web, apps, and software issues.',
        sortOrder: 90,
    },
    {
        nameEn: 'Creative & Design',
        nameFr: 'Création & Design',
        slug: 'creative-design',
        icon: '🎨',
        description: 'Logo design, UI/UX, and illustrations.',
        sortOrder: 80,
    },
    {
        nameEn: 'Health & Wellness',
        nameFr: 'Santé & Bien-être',
        slug: 'health-wellness',
        icon: '🧘‍♀️',
        description: 'Fitness, nutrition, and mental well-being.',
        sortOrder: 70,
    },
    {
        nameEn: 'Home Services',
        nameFr: 'Services à Domicile',
        slug: 'home-services',
        icon: '🏠',
        description: 'Cleaning, moving, and handyman services.',
        sortOrder: 60,
    },
    {
        nameEn: 'Business Support',
        nameFr: 'Support Entreprise',
        slug: 'business-support',
        icon: '📈',
        description: 'Consulting, marketing, and strategy.',
        sortOrder: 50,
    },
    {
        nameEn: 'Writing & Translation',
        nameFr: 'Rédaction & Traduction',
        slug: 'writing-translation',
        icon: '✍️',
        description: 'Content writing, editing, and translation.',
        sortOrder: 40,
    },
    {
        nameEn: 'Music & Arts',
        nameFr: 'Musique & Arts',
        slug: 'music-arts',
        icon: '🎵',
        description: 'Lessons, performance, and artistic guidance.',
        sortOrder: 30,
    },
];

async function main() {
    console.log('🌱 Seeding Categories...');

    for (const cat of categories) {
        const existing = await prisma.category.findUnique({
            where: { slug: cat.slug },
        });

        if (existing) {
            console.log(`- Updating ${cat.nameEn}...`);
            await prisma.category.update({
                where: { slug: cat.slug },
                data: cat,
            });
        } else {
            console.log(`+ Creating ${cat.nameEn}...`);
            await prisma.category.create({
                data: {
                    ...cat,
                    sortOrder: 0,
                    isActive: true,
                },
            });
        }
    }

    console.log('✅ Categories seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
