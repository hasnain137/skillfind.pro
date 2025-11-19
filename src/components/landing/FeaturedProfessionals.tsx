// src/components/landing/FeaturedProfessionals.tsx
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ProfessionalCard(pro: Professional) {
  const { id, name, role, location, isOnline, rating, reviews, priceFrom } =
    pro;

  return (
    <div className="flex min-w-[260px] flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm shadow-[#E5E7EB]/40 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#2563EBB3] text-xs font-semibold text-white">
          {getInitials(name)}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#333333]">{name}</h3>
          <p className="text-xs text-[#7C7373]">{role}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#7C7373]">
        <span className="text-[#F59E0B]">★</span>
        <span className="font-semibold text-[#333333]">{rating.toFixed(1)}</span>
        <span>({reviews} reviews)</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#7C7373]">
        <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5">{location}</span>
        {isOnline && (
          <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] text-[#166534]">
            Online available
          </span>
        )}
      </div>

      <p className="mt-1 text-xs font-medium text-[#333333]">{priceFrom}</p>

      <div className="mt-1">
        <Link href={`/pro/${id}`}>
          <Button className="w-full justify-center py-2.5 text-xs">
            View profile
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function FeaturedProfessionals() {
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
            {FEATURED_PROFESSIONALS.map((pro) => (
              <ProfessionalCard key={pro.id} {...pro} />
            ))}
          </div>

          <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROFESSIONALS.map((pro) => (
              <ProfessionalCard key={pro.id} {...pro} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

