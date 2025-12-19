// src/components/landing/TrustSection.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

export function TrustSection() {
  const t = useTranslations('TrustSection');

  const benefits = [
    {
      title: t('vettedTitle'),
      description: t('vettedDesc'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: t('connectTitle'),
      description: t('connectDesc'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      title: t('pricingTitle'),
      description: t('pricingDesc'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      title: t('qualityTitle'),
      description: t('qualityDesc'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  ];

  return (
    <section className="bg-[#FAFAFA] py-24 md:py-32">
      <Container>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:pr-12"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-[#3B4D9D]/10 text-[#3B4D9D] text-sm font-semibold mb-6">
              Why SkillFind?
            </span>
            <h2 className="text-4xl font-semibold tracking-tight text-[#333333] sm:text-5xl mb-6 leading-tight">
              {t('title')}
            </h2>
            <p className="text-xl text-[#7C7373] mb-10 leading-relaxed font-light">
              {t('subtitle')}
            </p>

            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-[#E5E7EB]">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-12 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <div className="text-sm font-medium">
                  <p className="text-[#333333] font-bold">{t('rating')}</p>
                  <p className="text-[#7C7373] text-xs">{t('ratingSub')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {benefits.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-4 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B4D9D] text-white shadow-lg shadow-blue-900/10 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#333333] mb-2">{item.title}</h3>
                  <p className="text-[#7C7373] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
