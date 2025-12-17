// src/components/landing/TrustSection.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

export function TrustSection() {
  const t = useTranslations('Landing.TrustSection');

  const benefits = [
    {
      title: t('benefits.vetted.title'),
      description: t('benefits.vetted.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: t('benefits.secure.title'),
      description: t('benefits.secure.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: t('benefits.fair.title'),
      description: t('benefits.fair.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      title: t('benefits.quality.title'),
      description: t('benefits.quality.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:pr-12"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-[#333333] sm:text-4xl mb-6">
              {t('title')}
            </h2>
            <p className="text-lg text-[#7C7373] mb-8 leading-relaxed">
              {t('intro')}
            </p>
            <div className="flex gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <div className="text-sm font-medium">
                <p className="text-[#333333]">{t('rating', { rating: 4.9 })}</p>
                <p className="text-[#7C7373]">{t('reviews')}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2">
            {benefits.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#333333]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#7C7373] leading-relaxed">
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
