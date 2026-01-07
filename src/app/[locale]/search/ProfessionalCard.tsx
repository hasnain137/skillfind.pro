// src/app/search/ProfessionalCard.tsx
'use client';

import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface Professional {
  id: string;
  userId: string;
  title: string | null;
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
  const t = useTranslations('ProfessionalCard');
  const { user, title, bio, hourlyRateMin, hourlyRateMax, location, isRemote, rating, reviewCount, services } = professional;

  const priceDisplay = hourlyRateMin && hourlyRateMax
    ? `€${hourlyRateMin}-${hourlyRateMax}/hr`
    : hourlyRateMin
      ? t('priceFrom', { price: hourlyRateMin })
      : t('contactForPricing');

  const primaryService = services[0]?.title || t('defaultService');
  const displayTitle = title || primaryService;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ring-1 ring-gray-900/5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar
          firstName={user.firstName}
          lastName={user.lastName}
          size="md"
          className="h-10 w-10 ring-2 ring-white"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#333333] truncate">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-xs text-[#7C7373] truncate">{displayTitle}</p>
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
          <span>({t('reviews', { count: reviewCount })})</span>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {location && (
          <span className="rounded-full bg-white/50 border border-gray-100 px-2 py-0.5 text-[11px] text-[#7C7373]">
            {location}
          </span>
        )}
        {isRemote && (
          <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">
            {t('remote')}
          </span>
        )}
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {services.slice(0, 2).map((service) => (
            <Badge key={service.id} variant="gray" className="text-[10px] bg-white/50 border border-gray-100 font-normal text-[#7C7373]">
              {service.title}
            </Badge>
          ))}
          {services.length > 2 && (
            <Badge variant="gray" className="text-[10px] bg-white/50 border border-gray-100 font-normal text-[#7C7373]">
              {t('moreServices', { count: services.length - 2 })}
            </Badge>
          )}
        </div>
      )}

      {/* Price */}
      <p className="text-xs font-medium text-[#333333]">{priceDisplay}</p>

      {/* Action */}
      <Link href={`/professionals/${professional.id}`}>
        <Button className="w-full justify-center py-2.5 text-xs bg-white hover:bg-gray-50 text-[#333333] border border-gray-200 shadow-sm hover:border-gray-300">
          {t('viewProfile')}
        </Button>
      </Link>
    </div>
  );
}
