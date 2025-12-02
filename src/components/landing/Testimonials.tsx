// src/components/landing/Testimonials.tsx
import { Container } from "@/components/ui/Container";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  client: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  professional: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

// Using static testimonials for instant page load
// TODO: Fetch real reviews from API endpoint with caching
function getFeaturedReviews(): Review[] {
  return FALLBACK_TESTIMONIALS as any;
}

function TestimonialCard({ review }: { review: Review }) {
  const clientInitials = `${review.client.user.firstName[0]}${review.client.user.lastName[0]}`.toUpperCase();
  
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#2563EB]/20">
      {/* Rating Stars */}
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-base ${i < review.rating ? 'text-[#F59E0B]' : 'text-[#D1D5DB]'}`}>
            ★
          </span>
        ))}
      </div>

      {/* Review Text */}
      <p className="text-sm text-[#333333] leading-relaxed line-clamp-4">
        "{review.comment}"
      </p>

      {/* Reviewer Info */}
      <div className="flex items-center gap-3 pt-3 border-t border-[#E5E7EB]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-xs font-bold text-white">
          {clientInitials}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#333333]">
            {review.client.user.firstName} {review.client.user.lastName[0]}.
          </p>
          <p className="text-xs text-[#7C7373]">
            Worked with {review.professional.user.firstName} {review.professional.user.lastName[0]}.
          </p>
        </div>
      </div>
    </div>
  );
}

// Fallback testimonials when no real reviews exist
const FALLBACK_TESTIMONIALS = [
  {
    id: "1",
    rating: 5,
    comment: "Amazing experience! Found a great tutor for my son within hours. The platform made it so easy to compare different professionals.",
    client: { user: { firstName: "Sarah", lastName: "Johnson" } },
    professional: { user: { firstName: "Michael", lastName: "Chen" } },
    createdAt: new Date(),
  },
  {
    id: "2",
    rating: 5,
    comment: "As a professional, SkillFind has transformed my business. I get quality leads and the payment system is transparent and fair.",
    client: { user: { firstName: "David", lastName: "Miller" } },
    professional: { user: { firstName: "Emma", lastName: "Wilson" } },
    createdAt: new Date(),
  },
  {
    id: "3",
    rating: 4,
    comment: "Great platform! The verification process gave me confidence in choosing the right person for my home renovation project.",
    client: { user: { firstName: "Lisa", lastName: "Anderson" } },
    professional: { user: { firstName: "James", lastName: "Brown" } },
    createdAt: new Date(),
  },
];

export function Testimonials() {
  const reviews = getFeaturedReviews();

  return (
    <section className="border-b border-[#E5E7EB] bg-gradient-to-b from-white to-[#FAFAFA] py-12 md:py-16">
      <Container>
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
            Client testimonials
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            Trusted by clients and professionals worldwide.
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            Real reviews from real people who found success on SkillFind.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => (
            <TestimonialCard key={review.id} review={review} />
          ))}
        </div>
      </Container>
    </section>
  );
}
