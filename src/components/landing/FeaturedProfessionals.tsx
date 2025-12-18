// src/components/landing/FeaturedProfessionals.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Link } from '@/i18n/routing';
import { Avatar } from "@/components/ui/Avatar";
import { useTranslations } from 'next-intl';

type Professional = {
  id: string;
  name: string;
  role: string;
  location: string;
  isOnline: boolean;
  rating: number;
  reviews: number;
  priceFrom: string;
};

const FEATURED_PROFESSIONALS: Professional[] = [
  {
    id: "1",
    name: "Anna Keller",
    role: "Math & exam prep tutor",
    location: "Berlin, Germany",
    isOnline: true,
    rating: 4.9,
    reviews: 38,
    priceFrom: "€30/hour",
  },
  {
    id: "2",
    name: "David Meyer",
    role: "Full-stack web developer",
    location: "Remote",
    isOnline: true,
    rating: 4.8,
    reviews: 52,
    priceFrom: "from €250/project",
  },
  {
    id: "3",
    name: "Sara Novak",
    role: "Fitness & nutrition coach",
    location: "Vienna, Austria",
    isOnline: true,
    rating: 4.9,
    reviews: 21,
    priceFrom: "€45/session",
  },
  {
    id: "4",
    name: "Luis Fernandez",
    role: "English & Spanish language tutor",
    location: "Online",
    isOnline: true,
    rating: 4.7,
    reviews: 44,
    priceFrom: "€25/hour",
  },
  {
    id: "5",
    name: "Marta Rossi",
    role: "Logo & brand designer",
    location: "Milan, Italy",
    isOnline: true,
    rating: 4.8,
    reviews: 29,
    priceFrom: "from €180/project",
  },
  {
    id: "6",
    name: "Jonas Weber",
    role: "Career & CV coach",
    location: "Hamburg, Germany",
    isOnline: true,
    rating: 4.9,
    reviews: 17,
    priceFrom: "€60/session",
  },
];



function ProfessionalCard(pro: Professional & { t: any }) {
  const { id, name, role, location, isOnline, rating, reviews, priceFrom, t } =
    pro;

  return (
    <div className="flex min-w-[260px] flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm shadow-[#E5E7EB]/40 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <Avatar
          firstName={name.split(' ')[0]}
          lastName={name.split(' ')[1]}
          size="md"
          className="h-10 w-10"
        />
        <div>
          <h3 className="text-sm font-semibold text-[#333333]">{name}</h3>
          <p className="text-xs text-[#7C7373]">{role}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#7C7373]">
        <span className="text-[#F59E0B]">★</span>
        <span className="font-semibold text-[#333333]">{rating.toFixed(1)}</span>
        <span>({reviews} {t('reviews')})</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#7C7373]">
        <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5">{location}</span>
        {isOnline && (
          <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] text-[#166534]">
            {t('online')}
          </span>
        )}
      </div>

      <p className="mt-1 text-xs font-medium text-[#333333]">{priceFrom}</p>

      <div className="mt-1">
        <Link href={`/professionals/${id}`}>
          <Button className="w-full justify-center py-2.5 text-xs">
            {t('viewProfile')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function FeaturedProfessionals() {
  const t = useTranslations('FeaturedProfessionals');

  return (
    <section
      id="top-professionals"
      className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-12 md:py-16"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C7373]">
            {t('badge')}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-8">
          <div className="flex gap-4 overflow-x-auto pb-2 sm:hidden">
            {FEATURED_PROFESSIONALS.map((pro) => (
              <ProfessionalCard key={pro.id} {...pro} t={t} />
            ))}
          </div>

          <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROFESSIONALS.map((pro) => (
              <ProfessionalCard key={pro.id} {...pro} t={t} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

