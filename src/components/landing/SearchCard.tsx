// src/components/landing/SearchCard.tsx
'use client';

import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { useTranslations } from 'next-intl';


export function SearchCard({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const t = useTranslations('Search');

  // Simple debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        try {
          const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (url: string) => {
    setShowSuggestions(false);
    router.push(url);
  };

  return (
    <div className={`w-full rounded-2xl bg-white p-4 shadow-md border border-[#E5E7EB] ${className} relative z-50`}>
      <form onSubmit={handleSearch} className="flex gap-3">
        {/* Big Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7C7373]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
            placeholder={t('placeholder')}
            className="w-full h-12 rounded-xl border border-[#E5E7EB] bg-white pl-12 pr-4 text-base text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#3B4D9D] focus:outline-none focus:ring-2 focus:ring-[#3B4D9D]/20 transition-all"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden z-50">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(item.url)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left border-b last:border-0 border-gray-100 transition-colors"
                >
                  <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#3B4D9D]">
                    {item.type === 'PROFESSIONAL' ? '👤' : item.type === 'CATEGORY' ? '📂' : '🔧'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#333333]">{item.label}</p>
                    <p className="text-xs text-[#7C7373]">{item.subLabel}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Find Button */}
        <Button
          type="submit"
          className="h-12 px-8 bg-[#3B4D9D] hover:bg-[#3B4D9D]/90 text-white font-semibold rounded-xl shrink-0"
        >
          {t('button')}
        </Button>
      </form>

      <p className="mt-3 text-xs text-[#7C7373]">
        {t('legal')}
      </p>
    </div>
  );
}

