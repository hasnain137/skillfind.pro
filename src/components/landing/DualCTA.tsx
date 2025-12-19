// src/components/landing/DualCTA.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function DualCTA() {
  const t = useTranslations('DualCTA');

  return (
    <section className="py-20 md:py-24 bg-white">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-[#3B4D9D] px-6 py-16 shadow-2xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fill="url(#gradient)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="gradient">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#3B4D9D" />
              </radialGradient>
            </defs>
          </svg>

          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t('unifiedTitle') || "Ready to get started?"}
              <br />
              {t('unifiedSubtitle') || "Join our community today."}
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              {t('unifiedDesc') || "Whether you're looking for help or looking for work, SkillFind is the place for you."}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Link href="/signup">
                <Button className="bg-white text-[#3B4D9D] hover:bg-gray-100 border-none font-bold px-8 py-3 text-base">
                  {t('unifiedButton') || "Get Started"}
                </Button>
              </Link>
              <Link href="/learn-more" className="text-sm font-semibold leading-6 text-white hover:text-blue-100 transition-colors">
                {t('learnMore') || "Learn more"} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="relative mt-16 h-80 lg:mt-8">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2850&q=80"
              alt="App screenshot"
              width={1824}
              height={1080}
              className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
