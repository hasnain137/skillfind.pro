// src/app/search/SearchFilters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Category {
  id: string;
  nameEn: string;
  slug: string;
}

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);

  // Get current filter values
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    minRating: searchParams.get('minRating') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    remote: searchParams.get('remote') || '',
  });

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data || []);
        }
      })
      .catch(console.error);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      category: '',
      minRating: '',
      maxPrice: '',
      remote: '',
    });
    router.push('/search');
  };

  return (
    <Card padding="lg" className="sticky top-4">
      <h3 className="text-sm font-semibold text-[#333333] mb-4">Filters</h3>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          Search
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Keywords..."
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        />
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          Location
        </label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          placeholder="City or region..."
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Remote */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.remote === 'true'}
            onChange={(e) => handleFilterChange('remote', e.target.checked ? 'true' : '')}
            className="h-4 w-4 rounded border-[#E5E7EB] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
          <span className="text-xs font-medium text-[#7C7373]">Remote only</span>
        </label>
      </div>

      {/* Min Rating */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          Minimum rating
        </label>
        <select
          value={filters.minRating}
          onChange={(e) => handleFilterChange('minRating', e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        >
          <option value="">Any rating</option>
          <option value="4.5">4.5+ stars</option>
          <option value="4.0">4.0+ stars</option>
          <option value="3.5">3.5+ stars</option>
          <option value="3.0">3.0+ stars</option>
        </select>
      </div>

      {/* Max Price */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          Max hourly rate (€)
        </label>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          placeholder="e.g. 50"
          min="0"
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters} className="w-full justify-center py-2">
          Apply Filters
        </Button>
        <button
          onClick={clearFilters}
          className="text-xs text-[#7C7373] hover:text-[#333333] underline"
        >
          Clear all
        </button>
      </div>
    </Card>
  );
}
