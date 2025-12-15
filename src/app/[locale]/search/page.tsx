// src/app/search/page.tsx
import { Suspense } from 'react';
import { SearchResults } from './SearchResults';
import { Container } from '@/components/ui/Container';
import { Navbar } from '@/components/layout/Navbar';
import { SkeletonProfessionalCard } from '@/components/ui/Skeleton';
import { getTranslations } from 'next-intl/server';

// No need for force-dynamic - the page wrapper is static,
// only SearchResults is dynamic (client component with useSearchParams)

export default async function SearchPage() {
  const t = await getTranslations('Search');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-[#FAFAFA] py-8">
        <Container>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[#333333] mb-2">
              {t('title')}
            </h1>
            <p className="text-sm text-[#7C7373]">
              {t('subtitle')}
            </p>
          </div>

          <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResults />
          </Suspense>
        </Container>
      </main>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Filters skeleton */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="h-6 w-20 bg-gray-200 rounded mb-4 animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-4">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Results skeleton */}
      <div className="lg:col-span-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonProfessionalCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
