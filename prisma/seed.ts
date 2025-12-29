import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Create PostgreSQL pool
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Prisma with the adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. PLATFORM SETTINGS
  // ============================================
  console.log('📋 Creating platform settings...');

  const settings = await prisma.platformSettings.findFirst();

  if (!settings) {
    await prisma.platformSettings.create({
      data: {
        phoneVerificationEnabled: false,
        clickFee: 10, // €0.10 in cents
        minimumWalletBalance: 200, // €2.00 in cents
        maxOffersPerRequest: 10,
      },
    });
    console.log('✅ Platform settings created\n');
  } else {
    console.log('⏭️  Platform settings already exist\n');
  }

  // ============================================
  // 2. CATEGORIES & SUBCATEGORIES
  // ============================================
  console.log('📂 Creating categories and subcategories...');

  // Home Repair & Maintenance
  const homeRepair = await prisma.category.upsert({
    where: { slug: 'home-repair' },
    update: {},
    create: {
      slug: 'home-repair',
      nameEn: 'Home Repair & Maintenance',
      nameFr: 'Réparation et entretien de la maison',
      icon: '🔧',
      sortOrder: 1,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'plumbing' },
    update: {},
    create: {
      categoryId: homeRepair.id,
      slug: 'plumbing',
      nameEn: 'Plumbing',
      nameFr: 'Plomberie',
      sortOrder: 1,
      requiresQualification: true,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'electrical' },
    update: {},
    create: {
      categoryId: homeRepair.id,
      slug: 'electrical',
      nameEn: 'Electrical Work',
      nameFr: 'Travaux électriques',
      sortOrder: 2,
      requiresQualification: true,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'carpentry' },
    update: {},
    create: {
      categoryId: homeRepair.id,
      slug: 'carpentry',
      nameEn: 'Carpentry',
      nameFr: 'Menuiserie',
      sortOrder: 3,
    },
  });

  console.log('✅ Home Repair category created');

  // Software & Tech
  const softwareTech = await prisma.category.upsert({
    where: { slug: 'software-tech' },
    update: {},
    create: {
      slug: 'software-tech',
      nameEn: 'Software & Tech',
      nameFr: 'Logiciel et technologie',
      icon: '💻',
      sortOrder: 2,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      categoryId: softwareTech.id,
      slug: 'web-development',
      nameEn: 'Web Development',
      nameFr: 'Développement web',
      sortOrder: 1,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'mobile-development' },
    update: {},
    create: {
      categoryId: softwareTech.id,
      slug: 'mobile-development',
      nameEn: 'Mobile Development',
      nameFr: 'Développement mobile',
      sortOrder: 2,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'it-support' },
    update: {},
    create: {
      categoryId: softwareTech.id,
      slug: 'it-support',
      nameEn: 'IT Support',
      nameFr: 'Support informatique',
      sortOrder: 3,
    },
  });

  console.log('✅ Software & Tech category created');

  // Tutoring & Education
  const tutoring = await prisma.category.upsert({
    where: { slug: 'tutoring' },
    update: {},
    create: {
      slug: 'tutoring',
      nameEn: 'Tutoring & Education',
      nameFr: 'Tutorat et éducation',
      icon: '📚',
      sortOrder: 3,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'math-tutoring' },
    update: {},
    create: {
      categoryId: tutoring.id,
      slug: 'math-tutoring',
      nameEn: 'Math Tutoring',
      nameFr: 'Tutorat en mathématiques',
      sortOrder: 1,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'language-tutoring' },
    update: {},
    create: {
      categoryId: tutoring.id,
      slug: 'language-tutoring',
      nameEn: 'Language Tutoring',
      nameFr: 'Tutorat linguistique',
      sortOrder: 2,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'music-lessons' },
    update: {},
    create: {
      categoryId: tutoring.id,
      slug: 'music-lessons',
      nameEn: 'Music Lessons',
      nameFr: 'Cours de musique',
      sortOrder: 3,
    },
  });

  console.log('✅ Tutoring category created');

  // Creative Services
  const creative = await prisma.category.upsert({
    where: { slug: 'creative' },
    update: {},
    create: {
      slug: 'creative',
      nameEn: 'Creative Services',
      nameFr: 'Services créatifs',
      icon: '🎨',
      sortOrder: 4,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'graphic-design' },
    update: {},
    create: {
      categoryId: creative.id,
      slug: 'graphic-design',
      nameEn: 'Graphic Design',
      nameFr: 'Conception graphique',
      sortOrder: 1,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'video-editing' },
    update: {},
    create: {
      categoryId: creative.id,
      slug: 'video-editing',
      nameEn: 'Video Editing',
      nameFr: 'Montage vidéo',
      sortOrder: 2,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'photography' },
    update: {},
    create: {
      categoryId: creative.id,
      slug: 'photography',
      nameEn: 'Photography',
      nameFr: 'Photographie',
      sortOrder: 3,
    },
  });

  console.log('✅ Creative Services category created');

  // Wellness & Coaching
  const wellness = await prisma.category.upsert({
    where: { slug: 'wellness' },
    update: {},
    create: {
      slug: 'wellness',
      nameEn: 'Wellness & Coaching',
      nameFr: 'Bien-être et coaching',
      icon: '🧘',
      sortOrder: 5,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'life-coaching' },
    update: {},
    create: {
      categoryId: wellness.id,
      slug: 'life-coaching',
      nameEn: 'Life Coaching',
      nameFr: 'Coaching de vie',
      sortOrder: 1,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'fitness-training' },
    update: {},
    create: {
      categoryId: wellness.id,
      slug: 'fitness-training',
      nameEn: 'Fitness Training',
      nameFr: 'Entraînement physique',
      sortOrder: 2,
    },
  });

  await prisma.subcategory.upsert({
    where: { slug: 'nutrition' },
    update: {},
    create: {
      categoryId: wellness.id,
      slug: 'nutrition',
      nameEn: 'Nutrition Consulting',
      nameFr: 'Conseil en nutrition',
      sortOrder: 3,
      requiresQualification: true,
    },
  });

  console.log('✅ Wellness category created\n');

  // ============================================
  // SUMMARY
  // ============================================
  const categoryCount = await prisma.category.count();
  const subcategoryCount = await prisma.subcategory.count();

  console.log('📊 Seed Summary:');
  console.log(`   • Platform Settings: 1`);
  console.log(`   • Categories: ${categoryCount}`);
  console.log(`   • Subcategories: ${subcategoryCount}`);
  console.log('\n✅ Database seeding completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
