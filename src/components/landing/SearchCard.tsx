// src/components/landing/SearchCard.tsx
'use client';

import { Button } from "@/components/ui/Button";
import { useState, useEffect, KeyboardEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { useTranslations } from 'next-intl';


export function SearchCard({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const t = useTranslations('Search');
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Simple debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        try {
          const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
          setSelectedIndex(-1); // Reset selection on new results
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

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);

    // Check if an item is selected via keyboard
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSuggestionClick(suggestions[selectedIndex].url);
      return;
    }

    const params = new URLSearchParams();
    if (query) params.set('search', query);
    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (url: string) => {
    setShowSuggestions(false);
    router.push(url);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      // If index is selected, handleSearch will pick it up, or we can explicit call here
      if (selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedIndex].url);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Helper to highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? <strong key={i} className="text-[#3B4D9D] font-bold">{part}</strong> : part
    );
  };

  return (
    <div className={`w-full rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-4 shadow-lg transition-all hover:shadow-xl hover:bg-white/80 ${className} relative z-50`}>
      <form onSubmit={handleSearch} className="flex gap-3">
        {/* Big Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7C7373]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
            placeholder={t('placeholder')}
            className="w-full h-12 rounded-xl border border-white/40 bg-white/50 pl-12 pr-4 text-base text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#3B4D9D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4D9D]/20 transition-all backdrop-blur-sm"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/40 overflow-hidden z-50 max-h-[300px] overflow-y-auto"
            >
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(item.url)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left border-b last:border-0 border-gray-100 transition-colors ${idx === selectedIndex ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                    }`}
                >
                  <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#3B4D9D]">
                    {item.type === 'PROFESSIONAL' ? '👤' : item.type === 'CATEGORY' ? '📂' : '🔧'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#333333]">
                      {highlightText(item.label, query)}
                    </p>
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

