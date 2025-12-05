// src/components/landing/FeaturedProfessionalsServer.tsx
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

interface Professional {
  id: string;
  userId: string;
  bio: string | null;
  city: string | null;
  remoteAvailability: string;
  averageRating: number;
  totalReviews: number;
  user: {
    firstName: string;
    lastName: string;
  };
  profile: {
    hourlyRateMin: number | null;
    hourlyRateMax: number | null;
  } | null;
  services: Array<{
    id: string;
    description: string | null;
  }>;
}



import { unstable_cache } from 'next/cache';

const getFeaturedProfessionals = unstable_cache(
  async (): Promise<Professional[]> => {
    try {
      const { prisma } = await import('@/lib/prisma');

      // Optimized query with selective fields to reduce data transfer
      const professionals = await prisma.professional.findMany({
        where: {
          status: 'ACTIVE',
          averageRating: {
            gt: 0, // Only professionals with rating
          },
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          profile: {
            select: {
              hourlyRateMin: true,
              hourlyRateMax: true,
            },
          },
          services: {
            select: {
              id: true,
              description: true,
            },
            take: 3,
          },
        },
        orderBy: {
          averageRating: 'desc',
        },
        take: 6,
      });

      return professionals as any;
    } catch (error) {
      console.error('Error fetching featured professionals:', error);
      return [];
    }
  },
  ['featured-professionals'],
  { revalidate: 3600, tags: ['featured-professionals'] }
);

function ProfessionalCard({
  professional,
}: {
  professional: Professional;
}) {
  const { user, bio, profile, city, remoteAvailability, averageRating, totalReviews, services } = professional;

  const hourlyRateMin = profile?.hourlyRateMin;
  const hourlyRateMax = profile?.hourlyRateMax;

  const priceDisplay = hourlyRateMin && hourlyRateMax
    ? `€${hourlyRateMin}-${hourlyRateMax}/hr`
    : hourlyRateMin
      ? `From €${hourlyRateMin}/hr`
      : 'Contact for pricing';

  const primaryService = services[0]?.description || 'Professional';
  const additionalServices = services.length > 1 ? services.length - 1 : 0;

  return (
    <div className="group relative flex min-w-[260px] flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg hover:ring-primary-500/20">
      {/* Top Badge - Verified */}
      <div className="absolute -top-2 right-4 flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-[10px] font-bold text-white shadow-soft">
        <span>✓</span> Verified
      </div>

      {/* Profile Header */}
      <div className="flex items-start gap-4 pt-2">
        <div className="relative">
          <Avatar
            firstName={user.firstName}
            lastName={user.lastName}
            size="lg"
            className="h-16 w-16 border-2 border-white shadow-soft ring-2 ring-primary-50"
          />
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-white ring-2 ring-success-light" title="Available now" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-surface-900 truncate group-hover:text-primary-600 transition-colors">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm font-medium text-surface-500 mt-0.5">{primaryService}</p>
          {additionalServices > 0 && (
            <p className="text-xs text-primary-600 font-bold mt-1">
              +{additionalServices} more {additionalServices === 1 ? 'service' : 'services'}
            </p>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-100/50">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-sm ${i < Math.round(averageRating) ? 'text-amber-400' : 'text-surface-200'}`}>
              ★
            </span>
          ))}
        </div>
        <span className="text-sm font-bold text-amber-900">{averageRating.toFixed(1)}</span>
        <span className="text-xs text-amber-700 font-medium">({totalReviews} reviews)</span>
      </div>

      {/* Bio snippet */}
      {bio && (
        <p className="text-sm text-surface-500 leading-relaxed line-clamp-2">
          {bio}
        </p>
      )}

      {/* Location & Remote */}
      <div className="flex flex-wrap items-center gap-2">
        {city && (
          <span className="flex items-center gap-1.5 rounded-full bg-surface-100 px-3 py-1 text-xs font-semibold text-surface-700">
            <span>📍</span> {city}
          </span>
        )}
        {remoteAvailability !== 'NO_REMOTE' && (
          <span className="flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-semibold text-success-dark">
            <span>💻</span> Remote
          </span>
        )}
      </div>

      {/* Price */}
      <div className="border-t border-surface-100 pt-4 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-surface-500 uppercase tracking-wide">Starting from</span>
          <span className="text-lg font-bold text-primary-600">{priceDisplay}</span>
        </div>

        {/* CTA Button */}
        <Link href={`/professionals/${professional.id}`}>
          <Button className="w-full justify-center py-2.5 text-sm font-bold transition-all">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}

export async function FeaturedProfessionalsServer() {
  const professionals = await getFeaturedProfessionals();

  // If no professionals in database, show fallback message
  if (professionals.length === 0) {
    return (
      <section
        id="top-professionals"
        className="py-20 md:py-24 bg-white border-b border-surface-200"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-primary-600">
              Featured professionals
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 md:text-4xl">
              Our top-rated professionals will appear here soon.
            </h2>
            <p className="mt-4 text-lg text-surface-500">
              Start exploring by searching for the service you need or browse by category.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      id="top-professionals"
      className="py-20 md:py-24 bg-white border-b border-surface-200"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-primary-600">
            Featured professionals
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 md:text-4xl">
            Meet highly rated experts.
          </h2>
          <p className="mt-4 text-lg text-surface-500 max-w-2xl mx-auto">
            These professionals have been vetted and reviewed by clients just like you.
          </p>
        </div>

        <div className="mt-12">
          {/* Mobile Scroll */}
          <div className="flex gap-6 overflow-x-auto pb-6 sm:hidden snap-x px-4 -mx-4">
            {professionals.map((pro) => (
              <div key={pro.id} className="snap-center">
                <ProfessionalCard professional={pro} />
              </div>
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden sm:grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/search">
            <Button variant="outline" className="px-8 py-3 h-auto text-base font-semibold">
              View All Professionals
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
