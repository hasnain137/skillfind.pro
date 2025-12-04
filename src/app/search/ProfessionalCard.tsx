// src/app/search/ProfessionalCard.tsx
'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
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



export function ProfessionalCard({ professional }: { professional: Professional }) {
  const { user, bio, hourlyRateMin, hourlyRateMax, location, isRemote, rating, reviewCount, services } = professional;

  const priceDisplay = hourlyRateMin && hourlyRateMax
    ? `€${hourlyRateMin}-${hourlyRateMax}/hr`
    : hourlyRateMin
      ? `From €${hourlyRateMin}/hr`
      : 'Contact for pricing';

  const primaryService = services[0]?.title || 'Professional';

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm shadow-[#E5E7EB]/40 transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar
          firstName={user.firstName}
          lastName={user.lastName}
          size="lg"
          className="h-12 w-12 border-2 border-white shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#333333] truncate">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-xs text-[#7C7373] truncate">{primaryService}</p>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-xs text-[#7C7373] line-clamp-2">
          {bio}
        </p>
      )}

      {/* Rating */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-[#7C7373]">
          <span className="text-[#F59E0B]">★</span>
          <span className="font-semibold text-[#333333]">{rating.toFixed(1)}</span>
          <span>({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {location && (
          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#7C7373]">
            📍 {location}
          </span>
        )}
        {isRemote && (
          <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] text-[#166534]">
            🌐 Remote
          </span>
        )}
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {services.slice(0, 2).map((service) => (
            <Badge key={service.id} variant="gray" className="text-[10px]">
              {service.title}
            </Badge>
          ))}
          {services.length > 2 && (
            <Badge variant="gray" className="text-[10px]">
              +{services.length - 2} more
            </Badge>
          )}
        </div>
      )}

      {/* Price */}
      <p className="text-xs font-medium text-[#333333]">{priceDisplay}</p>

      {/* Action */}
      <Link href={`/professionals/${professional.id}`}>
        <Button className="w-full justify-center py-2.5 text-xs">
          View Profile
        </Button>
      </Link>
    </div>
  );
}
