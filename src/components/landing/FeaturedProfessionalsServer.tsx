// src/components/landing/FeaturedProfessionalsServer.tsx
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

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

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

async function getFeaturedProfessionals(): Promise<Professional[]> {
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

    // Cache the result for 5 minutes in memory
    return professionals as any;
  } catch (error) {
    console.error('Error fetching featured professionals:', error);
    return [];
  }
}

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
    <div className="group relative flex min-w-[260px] flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm shadow-[#E5E7EB]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#2563EB]/20">
      {/* Top Badge - Verified */}
      <div className="absolute -top-2 right-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#2563EB] to-[#1D4FD8] px-3 py-1 text-[10px] font-semibold text-white shadow-md">
        <span>✓</span> Verified
      </div>

      {/* Profile Header */}
      <div className="flex items-start gap-3 pt-2">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-base font-bold text-white shadow-md ring-2 ring-white">
          {getInitials(user.firstName, user.lastName)}
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#10B981] border-2 border-white" title="Available now" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#333333] truncate group-hover:text-[#2563EB] transition-colors">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-xs text-[#7C7373] mt-0.5">{primaryService}</p>
          {additionalServices > 0 && (
            <p className="text-[10px] text-[#2563EB] font-medium mt-1">
              +{additionalServices} more {additionalServices === 1 ? 'service' : 'services'}
            </p>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] px-3 py-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-sm ${i < Math.round(averageRating) ? 'text-[#F59E0B]' : 'text-[#D1D5DB]'}`}>
              ★
            </span>
          ))}
        </div>
        <span className="text-xs font-bold text-[#92400E]">{averageRating.toFixed(1)}</span>
        <span className="text-xs text-[#78350F]">({totalReviews})</span>
      </div>

      {/* Bio snippet */}
      {bio && (
        <p className="text-xs text-[#7C7373] leading-relaxed line-clamp-2">
          {bio}
        </p>
      )}

      {/* Location & Remote */}
      <div className="flex flex-wrap items-center gap-2">
        {city && (
          <span className="flex items-center gap-1 rounded-lg bg-[#F3F4F6] px-2.5 py-1.5 text-[11px] font-medium text-[#374151]">
            <span>📍</span> {city}
          </span>
        )}
        {remoteAvailability !== 'NO_REMOTE' && (
          <span className="flex items-center gap-1 rounded-lg bg-[#DCFCE7] px-2.5 py-1.5 text-[11px] font-semibold text-[#166534]">
            <span>💻</span> Remote
          </span>
        )}
      </div>

      {/* Price */}
      <div className="border-t border-[#E5E7EB] pt-4 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#7C7373]">Starting at</span>
          <span className="text-base font-bold text-[#2563EB]">{priceDisplay}</span>
        </div>

        {/* CTA Button */}
        <Link href={`/pro/${professional.userId}`}>
          <Button className="w-full justify-center py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all">
            View Full Profile →
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
        className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-12 md:py-16"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C7373]">
              Featured professionals
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
              Our top-rated professionals will appear here soon.
            </h2>
            <p className="mt-3 text-sm text-[#7C7373] md:text-base">
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
      className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-12 md:py-16"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C7373]">
            Featured professionals
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            Meet some of the experts clients are hiring on SkillFind.
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            These are just a few examples. You&apos;ll see even more matching
            professionals once you post a request or search by category.
          </p>
        </div>

        <div className="mt-8">
          <div className="flex gap-4 overflow-x-auto pb-2 sm:hidden">
            {professionals.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>

          <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/search">
            <Button className="px-6 py-2.5">View All Professionals</Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
