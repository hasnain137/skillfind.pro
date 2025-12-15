import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PopularCategories } from "@/components/landing/PopularCategories";
import { FeaturedProfessionalsServer } from "@/components/landing/FeaturedProfessionalsServer";
import { SuggestedSkills } from "@/components/landing/SuggestedSkills";
import { TrustSection } from "@/components/landing/TrustSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { DualCTA } from "@/components/landing/DualCTA";
import { CategoryDirectory } from "@/components/landing/CategoryDirectory";
import { Footer } from "@/components/landing/Footer";
import { Suspense } from "react";
import { SkeletonProfessionalCard } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

// Use ISR (Incremental Static Regeneration) for better performance
// Revalidate every 60 seconds - balances freshness with performance
export const revalidate = 60;

// Server Component to fetch categories
import { unstable_cache } from 'next/cache';

// Server Component to fetch categories
const getCategories = unstable_cache(
  async () => {
    try {
      // Dynamic import to ensure it's only loaded on server
      const { prisma } = await import('@/lib/prisma');

      const categories = await prisma.category.findMany({
        select: {
          id: true,
          nameEn: true,
          nameFr: true,
          description: true,
          icon: true,
          slug: true,
          subcategories: {
            select: {
              id: true,
              nameEn: true,
              slug: true,
            },
            orderBy: {
              nameEn: 'asc',
            },
          },
        },
        orderBy: [
          { sortOrder: 'desc' },
          { nameEn: 'asc' },
        ],
      });

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return []; // Return empty array on error, component will use fallback
    }
  },
  ['categories'],
  { revalidate: 86400, tags: ['categories'] }
);

function FeaturedProfessionalsSkeleton() {
  return (
    <section className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-8">
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-8 w-96 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-full max-w-2xl bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
        <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonProfessionalCard key={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <PopularCategories categories={categories} />
        <Suspense fallback={<FeaturedProfessionalsSkeleton />}>
          <FeaturedProfessionalsServer />
        </Suspense>
        <Testimonials />
        <SuggestedSkills />
        <TrustSection />
        <DualCTA />
        <CategoryDirectory categories={categories} />
      </main>
      <Footer />
    </div>
  );
}
