// src/app/search/SearchResults.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchFilters } from './SearchFilters';
import { MobileFilterDrawer } from './MobileFilterDrawer';
import { ProfessionalCard } from './ProfessionalCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

interface Professional {
  id: string;
  userId: string;
  bio: string | null;
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  location: string | null;
  availability: string;
  isRemote: boolean;
  rating: number;
  reviewCount: number;
  user: {
    firstName: string;
    lastName: string;
  };
  services: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
}

interface SearchResponse {
  success: boolean;
  data: {
    professionals: Professional[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Get filter values from URL
  const query = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const category = searchParams.get('category') || '';
  const minRating = searchParams.get('minRating') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const remote = searchParams.get('remote') || '';

  useEffect(() => {
    fetchProfessionals();
  }, [searchParams, page]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (query) params.set('search', query);
      if (location) params.set('location', location);
      if (category) params.set('category', category);
      if (minRating) params.set('minRating', minRating);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (remote) params.set('remote', remote);

      const response = await fetch(`/api/professionals/search?${params.toString()}`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setProfessionals(data.data.professionals);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Mobile Filter Button */}
      <div className="mb-4 lg:hidden">
        <MobileFilterDrawer />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar - Desktop Only */}
        <div className="hidden lg:col-span-1 lg:block">
          <SearchFilters />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
        {/* Results header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-[#7C7373]">
            {loading ? (
              <span>Searching...</span>
            ) : (
              <span>
                {total} professional{total !== 1 ? 's' : ''} found
                {query && <span> for &quot;{query}&quot;</span>}
              </span>
            )}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Results grid */}
        {!loading && professionals.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {professionals.map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2"
                >
                  Previous
                </Button>
                <span className="text-sm text-[#7C7373]">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="px-4 py-2"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && professionals.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No professionals found"
            description="Try adjusting your search filters or browse all categories to find the right professional for your needs."
            action={{
              label: 'Clear filters',
              href: '/search',
            }}
          />
        )}
        </div>
      </div>
    </div>
  );
}
