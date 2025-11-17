// src/components/landing/FeaturedProfessionals.tsx
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type Professional = {
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
    name: "Anna Keller",
    role: "Math & exam prep tutor",
    location: "Berlin, Germany",
    isOnline: true,
    rating: 4.9,
    reviews: 38,
    priceFrom: "€30/hour",
  },
  {
    name: "David Meyer",
    role: "Full-stack web developer",
    location: "Remote",
    isOnline: true,
    rating: 4.8,
    reviews: 52,
    priceFrom: "from €250/project",
  },
  {
    name: "Sara Novak",
    role: "Fitness & nutrition coach",
    location: "Vienna, Austria",
    isOnline: true,
    rating: 4.9,
    reviews: 21,
    priceFrom: "€45/session",
  },
  {
    name: "Luis Fernández",
    role: "English & Spanish language tutor",
    location: "Online",
    isOnline: true,
    rating: 4.7,
    reviews: 44,
    priceFrom: "€25/hour",
  },
  {
    name: "Marta Rossi",
    role: "Logo & brand designer",
    location: "Milan, Italy",
    isOnline: true,
    rating: 4.8,
    reviews: 29,
    priceFrom: "from €180/project",
  },
  {
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

function ProfessionalCard({
  name,
  role,
  location,
  isOnline,
  rating,
  reviews,
  priceFrom,
}: Professional) {
  return (
    <div className="flex min-w-[260px] flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm shadow-[#E5E7EB]/40 transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Top: avatar + name */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#2563EBB3] text-xs font-semibold text-white">
          {getInitials(name)}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#333333]">{name}</h3>
          <p className="text-xs text-[#7C7373]">{role}</p>
        </div>
      </div>

      {/* Rating + reviews */}
      <div className="flex items-center gap-2 text-xs text-[#7C7373]">
        <span className="text-[#F59E0B]">★</span>
        <span className="font-semibold text-[#333333]">{rating.toFixed(1)}</span>
        <span>({reviews} reviews)</span>
      </div>

      {/* Location + availability */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#7C7373]">
        <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5">
          {location}
        </span>
        {isOnline && (
          <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] text-[#166534]">
            Online available
          </span>
        )}
      </div>

      {/* Price */}
      <p className="mt-1 text-xs font-medium text-[#333333]">
        {priceFrom}
      </p>

      {/* Button */}
      <div className="mt-1">
        <Button className="w-full justify-center text-xs py-2.5">
          View profile
        </Button>
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
        {/* Section heading */}
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

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="mt-8">
          <div className="flex gap-4 overflow-x-auto pb-2 sm:hidden">
            {FEATURED_PROFESSIONALS.map((pro) => (
              <ProfessionalCard key={pro.name} {...pro} />
            ))}
          </div>

          <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROFESSIONALS.map((pro) => (
              <ProfessionalCard key={pro.name} {...pro} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
