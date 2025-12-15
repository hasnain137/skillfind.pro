// src/app/search/SearchFilters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  nameEn: string;
  slug: string;
}

export function SearchFilters({ onApply }: { onApply?: () => void }) {
  const t = useTranslations('Search');
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
    onApply?.(); // Close drawer on mobile
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
      <h3 className="text-sm font-semibold text-[#333333] mb-4">{t('filters.title')}</h3>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          {t('filters.searchLabel')}
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder={t('filters.searchPlaceholder')}
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        />
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          {t('filters.locationLabel')}
        </label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          placeholder={t('filters.locationPlaceholder')}
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          {t('filters.categoryLabel')}
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        >
          <option value="">{t('filters.allCategories')}</option>
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
          <span className="text-xs font-medium text-[#7C7373]">{t('filters.remoteLabel')}</span>
        </label>
      </div>

      {/* Min Rating */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          {t('filters.ratingLabel')}
        </label>
        <select
          value={filters.minRating}
          onChange={(e) => handleFilterChange('minRating', e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        >
          <option value="">{t('filters.anyRating')}</option>
          <option value="4.5">{t('filters.stars', { count: 4.5 })}</option>
          <option value="4.0">{t('filters.stars', { count: 4.0 })}</option>
          <option value="3.5">{t('filters.stars', { count: 3.5 })}</option>
          <option value="3.0">{t('filters.stars', { count: 3.0 })}</option>
        </select>
      </div>

      {/* Max Price */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          {t('filters.priceLabel')}
        </label>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          placeholder={t('filters.pricePlaceholder')}
          min="0"
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters} className="w-full justify-center py-2">
          {t('filters.apply')}
        </Button>
        <button
          onClick={clearFilters}
          className="text-xs text-[#7C7373] hover:text-[#333333] underline"
        >
          {t('filters.clear')}
        </button>
      </div>
    </Card>
  );
}
