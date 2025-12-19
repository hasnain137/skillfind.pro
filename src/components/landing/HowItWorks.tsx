// src/components/landing/HowItWorks.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { Stagger } from "@/components/ui/motion/Stagger";
import { FadeIn } from "@/components/ui/motion/FadeIn";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

export function HowItWorks() {
  const t = useTranslations('HowItWorks');

  const steps = [
    {
      number: "1",
      title: t('step1Title'),
      description: t('step1Desc'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      number: "2",
      title: t('step2Title'),
      description: t('step2Desc'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      number: "3",
      title: t('step3Title'),
      description: t('step3Desc'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-wider text-[#3B4D9D]">
              {t('badge')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tighter text-[#333333] md:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-[#7C7373] max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <Stagger className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <motion.div key={step.number} variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
              <div className="relative group h-full p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                {/* Icon */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#3B4D9D] group-hover:bg-[#3B4D9D] group-hover:text-white transition-colors duration-300">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[#333333] mb-2">{step.title}</h3>

                {/* Description */}
                <p className="text-sm text-[#7C7373] leading-relaxed">
                  {step.description}
                </p>

                {/* Step number watermark */}
                <div className="absolute top-4 right-6 text-6xl font-black text-[#333333]/10 -z-0 select-none pointer-events-none group-hover:text-[#3B4D9D]/20 transition-colors">
                  {step.number}
                </div>
              </div>
            </motion.div>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
