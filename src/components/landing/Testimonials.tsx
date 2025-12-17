// src/components/landing/Testimonials.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { useTranslations } from 'next-intl';

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

function TestimonialCard({ review, index, t }: { review: Review; index: number; t: any }) {
  // const clientInitials = `${review.client.user.firstName[0]}${review.client.user.lastName[0]}`.toUpperCase(); // Unused

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
          size="lg"
          className="h-12 w-12 border-2 border-white shadow-sm"
        />
        <div>
          <p className="font-semibold text-[#333333]">
            {review.client.user.firstName} {review.client.user.lastName[0]}.
          </p>
          <p className="text-xs text-[#7C7373]">
            {t('hiredFor')} <span className="text-[#2563EB]">Services</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const t = useTranslations('Testimonials');

  // Fallback testimonials when no real reviews exist
  const FALLBACK_TESTIMONIALS = [
    {
      id: "1",
      rating: 5,
      comment: t('review1'),
      client: { user: { firstName: "Sarah", lastName: "Johnson" } },
      professional: { user: { firstName: "Michael", lastName: "Chen" } },
      createdAt: new Date(),
    },
    {
      id: "2",
      rating: 5,
      comment: t('review2'),
      client: { user: { firstName: "David", lastName: "Miller" } },
      professional: { user: { firstName: "Emma", lastName: "Wilson" } },
      createdAt: new Date(),
    },
    {
      id: "3",
      rating: 4,
      comment: t('review3'),
      client: { user: { firstName: "Lisa", lastName: "Anderson" } },
      professional: { user: { firstName: "James", lastName: "Brown" } },
      createdAt: new Date(),
    },
  ];

  const reviews = FALLBACK_TESTIMONIALS as any; // Cast to bypass strict type check for now if exact match fails

  return (
    <section className="py-20 md:py-24 bg-[#FAFAFA] border-b border-[#E5E7EB]">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
            {t('badge')}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#333333] md:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-[#7C7373] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review: Review, index: number) => (
            <TestimonialCard key={review.id} review={review} index={index} t={t} />
          ))}
        </div>
      </Container>
    </section>
  );
}
