// src/components/landing/Hero.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { SearchCard } from "./SearchCard";
import { LiveStats } from "./LiveStats";
import Image from "next/image";
import { FadeIn } from "@/components/ui/motion/FadeIn";
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('Hero');

  return (
    <section className="relative overflow-hidden border-b border-[#E5E7EB] bg-white pt-8 pb-12 md:pt-16 md:pb-20 lg:pt-24 lg:pb-28">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />
      </div>

      <Container className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">

          {/* Left Column: Text & Search */}
          <FadeIn className="flex flex-col gap-6 text-center lg:text-left">
            <div>
              <FadeIn delay={0.2} className="inline-flex items-center rounded-full bg-[#3B4D9D]/10 px-3 py-1 text-xs font-medium text-[#3B4D9D] ring-1 ring-inset ring-[#3B4D9D]/20 mb-4">
                {t('badge')}
              </FadeIn>
              <h1 className="text-4xl font-semibold tracking-tighter text-[#333333] sm:text-5xl md:text-6xl">
                {t('titlePrefix')} <span className="text-[#3B4D9D]">{t('titleHighlight')}</span> {t('titleSuffix')}
              </h1>
              <p className="mt-4 text-lg text-[#7C7373] max-w-2xl mx-auto lg:mx-0">
                {t('subtitle')}
              </p>
            </div>

            <div className="w-full max-w-xl mx-auto lg:mx-0">
              <SearchCard />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-[#7C7373]">
              <span className="flex items-center gap-1.5">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('verifiedPros')}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('directContact')}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('satisfactionGuarantee')}
              </span>
            </div>
          </FadeIn>

          {/* Right Column: Image */}
          <FadeIn
            delay={0.2}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto w-full max-w-[600px] aspect-[4/3]">
              {/* Decorative elements behind image */}
              <div className="absolute -top-4 -right-4 h-full w-full rounded-2xl bg-[#3B4D9D]/10 -z-10" />
              <div className="absolute -bottom-4 -left-4 h-full w-full rounded-2xl bg-[#F3F4F6] -z-10" />

              <Image
                src="/hero-collage.png"
                alt="Diverse professionals working"
                fill
                className="object-cover rounded-2xl shadow-lg border border-[#E5E7EB]"
                priority
              />

              {/* Floating Badge */}
              <FadeIn
                delay={0.6}
                variant="scale"
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-[#E5E7EB] flex items-center gap-3"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-[#E5E7EB]" />
                  ))}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#333333]">{t('newProsBadge')}</p>
                  <p className="text-[#7C7373]">{t('joinedThisWeek')}</p>
                </div>
              </FadeIn>
            </div>
          </FadeIn>

        </div>

        <div className="mt-16 border-t border-[#E5E7EB] pt-8">
          <LiveStats />
        </div>
      </Container>
    </section>
  );
}
