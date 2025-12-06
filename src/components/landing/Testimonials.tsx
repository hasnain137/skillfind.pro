// src/components/landing/Testimonials.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";

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

function getFeaturedReviews(): Review[] {
  return FALLBACK_TESTIMONIALS as any;
}

function TestimonialCard({ review, index }: { review: Review; index: number }) {
  const clientInitials = `${review.client.user.firstName[0]}${review.client.user.lastName[0]}`.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="group flex flex-col justify-between rounded-2xl bg-white p-8 shadow-sm border border-[#E5E7EB] transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      <div>
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-lg ${i < review.rating ? 'text-amber-400' : 'text-[#E5E7EB]'}`}>
              ★
            </span>
          ))}
        </div>

        <div className="relative">
          <span className="absolute -top-4 -left-2 text-6xl text-[#E5E7EB] font-serif leading-none select-none">"</span>
          <p className="relative text-base text-[#333333] leading-relaxed">
            {review.comment}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-6 mt-6 border-t border-[#E5E7EB]">
        <Avatar
          firstName={review.client.user.firstName}
          lastName={review.client.user.lastName}
          size="lg" // h-12 w-12 is roughly md/lg depending on sizing, let's check. md is 10, lg is 14. h-12 is 48px. 
          className="h-12 w-12 border-2 border-white shadow-sm"
        />
        <div>
          <p className="font-semibold text-[#333333]">
            {review.client.user.firstName} {review.client.user.lastName[0]}.
          </p>
          <p className="text-xs text-[#7C7373]">
            Hired a pro for <span className="text-[#2563EB]">Services</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const reviews = getFeaturedReviews();

  return (
    <section className="py-20 md:py-24 bg-[#FAFAFA] border-b border-[#E5E7EB]">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
            Client Success Stories
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#333333] md:text-4xl">
            Trusted by clients and professionals.
          </h2>
          <p className="mt-4 text-lg text-[#7C7373] max-w-2xl mx-auto">
            See what our community has to say about their experience on SkillFind.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review, index) => (
            <TestimonialCard key={review.id} review={review} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
