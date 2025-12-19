// src/app/search/SearchFilters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  nameEn: string;
  slug: string;
}

// Popular cities in France for quick selection
const POPULAR_CITIES = [
  { value: '', label: 'Any Location' },
  { value: 'Paris', label: 'Paris' },
  { value: 'Lyon', label: 'Lyon' },
  { value: 'Marseille', label: 'Marseille' },
  { value: 'Toulouse', label: 'Toulouse' },
  { value: 'Nice', label: 'Nice' },
  { value: 'Nantes', label: 'Nantes' },
  { value: 'Strasbourg', label: 'Strasbourg' },
  { value: 'Bordeaux', label: 'Bordeaux' },
  { value: 'Lille', label: 'Lille' },
  { value: 'Remote', label: 'Remote Only' },
];

export function SearchFilters({ onApply }: { onApply?: () => void }) {
  const t = useTranslations('Search');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCustomLocation, setShowCustomLocation] = useState(false);

  // Get current filter values
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    minRating: searchParams.get('minRating') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    remote: searchParams.get('remote') || '',
  });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return false; // Don't count search as filter
      return value !== '';
    }).length;
  }, [filters]);

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

  // Check if location is custom (not in popular cities)
  useEffect(() => {
    const isCustom = !!filters.location && !POPULAR_CITIES.find(c => c.value === filters.location);
    setShowCustomLocation(isCustom);
  }, [filters.location]);

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
      minPrice: '',
      maxPrice: '',
      remote: '',
    });
    router.push('/search');
  };

  return (
    <Card padding="lg" className="sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#333333]">{t('filters.title')}</h3>
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-bold text-white bg-[#2563EB] rounded-full">
            {activeFilterCount}
          </span>
        )}
      </div>

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

      {/* Location - City Dropdown + Custom */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          {t('filters.locationLabel')}
        </label>
        <select
          value={showCustomLocation ? '__custom__' : filters.location}
          onChange={(e) => {
            if (e.target.value === '__custom__') {
              setShowCustomLocation(true);
              handleFilterChange('location', '');
            } else {
              setShowCustomLocation(false);
              handleFilterChange('location', e.target.value);
            }
          }}
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
        >
          {POPULAR_CITIES.map((city) => (
            <option key={city.value || 'any'} value={city.value}>
              {city.label}
            </option>
          ))}
          <option value="__custom__">Other City...</option>
        </select>
        {showCustomLocation && (
          <input
            type="text"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            placeholder="Enter city name"
            className="w-full mt-2 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
          />
        )}
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

      {/* Price Range */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#7C7373] mb-1.5">
          {t('filters.priceLabel')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="Min €"
            min="0"
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Max €"
            min="0"
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters} className="w-full justify-center py-2">
          {t('filters.apply')}
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </Button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#7C7373] hover:text-[#333333] underline"
          >
            {t('filters.clear')}
          </button>
        )}
      </div>
    </Card>
  );
}

