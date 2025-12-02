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

  return (
    <div className="flex min-w-[260px] flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm shadow-[#E5E7EB]/40 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#2563EBB3] text-xs font-semibold text-white">
          {getInitials(user.firstName, user.lastName)}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#333333]">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-xs text-[#7C7373]">{primaryService}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#7C7373]">
        <span className="text-[#F59E0B]">★</span>
        <span className="font-semibold text-[#333333]">{averageRating.toFixed(1)}</span>
        <span>({totalReviews} reviews)</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#7C7373]">
        {city && (
          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5">{city}</span>
        )}
        {remoteAvailability !== 'NO_REMOTE' && (
          <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] text-[#166534]">
            Online available
          </span>
        )}
      </div>

      <p className="mt-1 text-xs font-medium text-[#333333]">{priceDisplay}</p>

      <div className="mt-1">
        <Link href={`/pro/${professional.userId}`}>
          <Button className="w-full justify-center py-2.5 text-xs">
            View profile
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
