// src/components/landing/SearchCard.tsx
'use client';

import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchCard() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (location) params.set('location', location);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mx-auto mt-7 w-full max-w-2xl rounded-2xl bg-gradient-to-br from-white to-[#2563EB0D] p-5 shadow-md shadow-[#E5E7EB]/40">
      <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end">
        
        {/* Service input */}
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
            What do you need?
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Math tutor, Web developer, Fitness coach…"
            className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </div>

        {/* Location input */}
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-[#7C7373]">
            Where?
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Berlin, Online, Remote…"
            className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </div>

        {/* Search button */}
        <div className="md:w-auto md:self-end">
          <Button
            type="submit"
            className="w-full px-5 py-2.5 text-sm md:w-auto"
          >
            Find professionals
          </Button>
        </div>

      </form>

      <p className="mt-2.5 text-xs text-[#7C7373]">
        Clients don&apos;t pay any extra fees. Professionals pay a small fee
        only when you view their full profile.
      </p>
    </div>
  );
}
