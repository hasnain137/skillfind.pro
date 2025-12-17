// src/components/landing/SearchCard.tsx
'use client';

import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from 'next-intl';

export function SearchCard({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const t = useTranslations('Landing.SearchCard');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className={`w-full rounded-2xl bg-white p-4 shadow-md border border-[#E5E7EB] ${className}`}>
      <form onSubmit={handleSearch} className="flex gap-3">
        {/* Big Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7C7373]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full h-12 rounded-xl border border-[#E5E7EB] bg-white pl-12 pr-4 text-base text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
          />
        </div>

        {/* Find Button */}
        <Button
          type="submit"
          className="h-12 px-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl shrink-0"
        >
          {t('button')}
        </Button>
      </form>

      <p className="mt-3 text-xs text-[#7C7373]">
        {t('disclaimer')}
      </p>
    </div>
  );
}
