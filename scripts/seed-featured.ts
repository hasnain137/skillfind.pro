
import 'dotenv/config';
import { PrismaClient, UserRole, ProfessionalStatus, VerificationMethod, RemoteAvailability } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding Featured Professionals...');

    // 1. Get some categories to link to
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: { subcategories: true }
    });

    const techCat = categories.find(c => c.slug === 'software-tech');
    const designCat = categories.find(c => c.slug === 'creative');
    const tutorCat = categories.find(c => c.slug === 'tutoring');

    const webDev = techCat?.subcategories.find(s => s.slug === 'web-development');
    const graphicDesign = designCat?.subcategories.find(s => s.slug === 'graphic-design');
    const englishTutor = categories.find(c => c.slug.includes('english'))?.subcategories[0] ||
        tutorCat?.subcategories.find(s => s.slug === 'language-tutoring');

    if (!webDev || !graphicDesign) {
        console.error('❌ Required subcategories not found. Run standard seed first.');
        return;
    }

    // 2. Create Professionals
    const pros = [
        {
            email: 'featured.dev@example.com',
            firstName: 'Alex',
            lastName: 'Richardson',
            title: 'Senior Full Stack Developer',
            bio: 'Over 10 years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. I deliver clean, maintainable code and exceptional user experiences.',
            hourlyRateMin: 80,
            hourlyRateMax: 150,
            rating: 5.0,
            reviews: 42,
            subcategory: webDev,
            status: ProfessionalStatus.ACTIVE,
            isVerified: true
        },
        {
            email: 'featured.design@example.com',
            firstName: 'Sarah',
            lastName: 'Chen',
            title: 'Brand Identity Specialist',
            bio: 'Award-winning designer specializing in brand identity and UI/UX. I help startups and established businesses create memorable visual experiences that resonate with their audience.',
            hourlyRateMin: 65,
            hourlyRateMax: 120,
            rating: 4.9,
            reviews: 38,
            subcategory: graphicDesign,
            status: ProfessionalStatus.ACTIVE,
            isVerified: true
        },
        {
            email: 'featured.tutor@example.com',
            firstName: 'Emma',
            lastName: 'Wilson',
            title: 'Certified English Tutor',
            bio: 'TEFL certified tutor with a passion for helping students achieve fluency. I specialize in business English and exam preparation (IELTS, TOEFL) with a proven track record of student success.',
            hourlyRateMin: 40,
            hourlyRateMax: 60,
            rating: 4.9,
            reviews: 156,
            subcategory: englishTutor || webDev, // Fallback if english tutor not found
            status: ProfessionalStatus.ACTIVE,
            isVerified: true
        }
    ];

    for (const pro of pros) {
        // Upsert User
        const user = await prisma.user.upsert({
            where: { email: pro.email },
            update: {
                role: UserRole.PROFESSIONAL,
                firstName: pro.firstName,
                lastName: pro.lastName,
                isActive: true
            },
            create: {
                email: pro.email,
                clerkId: `mock_${pro.email}`, // Mock Clerk ID
                role: UserRole.PROFESSIONAL,
                firstName: pro.firstName,
                lastName: pro.lastName,
                isActive: true,
                emailVerified: true
            }
        });

        // Upsert Professional
        const professional = await prisma.professional.upsert({
            where: { userId: user.id },
            update: {
                status: pro.status,
                isVerified: pro.isVerified,
                averageRating: pro.rating,
                totalReviews: pro.reviews,
                completedJobs: pro.reviews + 5, // A bit more than reviews
                businessName: `${pro.firstName} ${pro.lastName} Services`,
                title: pro.title,
                bio: pro.bio,
                city: 'Paris',
                country: 'FR',
                remoteAvailability: RemoteAvailability.YES_AND_ONSITE
            },
            create: {
                userId: user.id,
                status: pro.status,
                isVerified: pro.isVerified,
                averageRating: pro.rating,
                totalReviews: pro.reviews,
                completedJobs: pro.reviews + 5,
                businessName: `${pro.firstName} ${pro.lastName} Services`,
                title: pro.title,
                bio: pro.bio,
                city: 'Paris',
                country: 'FR',
                remoteAvailability: RemoteAvailability.YES_AND_ONSITE
            }
        });

        // Upsert Profile
        await prisma.professionalProfile.upsert({
            where: { professionalId: professional.id },
            update: {
                hourlyRateMin: pro.hourlyRateMin,
                hourlyRateMax: pro.hourlyRateMax,
                preferredLanguage: 'en'
            },
            create: {
                professionalId: professional.id,
                hourlyRateMin: pro.hourlyRateMin,
                hourlyRateMax: pro.hourlyRateMax,
                preferredLanguage: 'en'
            }
        });

        // Upsert Service
        if (pro.subcategory) {
            // Clean up old services first to avoid conflicts if re-seeding
            await prisma.professionalService.deleteMany({
                where: { professionalId: professional.id }
            });

            await prisma.professionalService.create({
                data: {
                    professionalId: professional.id,
                    subcategoryId: pro.subcategory.id,
                    description: pro.title,
                    priceFrom: pro.hourlyRateMin * 100, // stored in cents? Schema usually implies int currency
                    priceTo: pro.hourlyRateMax * 100
                }
            });
        }

        console.log(`✅ Seeded professional: ${pro.firstName} ${pro.lastName}`);
    }

    console.log('\n✨ Featured professionals seeded successfully!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
