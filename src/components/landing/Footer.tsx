// src/components/layout/Footer.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl'; // Client hook
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function Footer() { // Not async
  const t = useTranslations('Footer'); // Client hook

  return (
    <footer className="border-t border-[#E5E7EB] bg-[#FAFAFA] py-12 md:py-16">
      <Container>
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Brand + short text */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white shadow-sm">
                SF
              </div>
              <span className="text-base font-bold text-[#333333]">
                Skill<span className="text-[#2563EB]">Find</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-[#7C7373] leading-relaxed">
              {t('brandSlogan')}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 text-sm text-[#7C7373] md:grid-cols-3">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">
                {t('forClients')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/search" className="hover:text-[#2563EB] transition-colors">
                    {t('browseCategories')}
                  </Link>
                </li>
                <li>
                  <Link href="#top-professionals" className="hover:text-[#2563EB] transition-colors">
                    {t('featuredPros')}
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-[#2563EB] transition-colors">
                    {t('howItWorks')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">
                {t('forProfessionals')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/signup" className="hover:text-[#2563EB] transition-colors">
                    {t('becomePro')}
                  </Link>
                </li>
                <li>
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    {t('pricing')}
                  </button>
                </li>
                <li>
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    {t('help')}
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">
                {t('company')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    {t('about')}
                  </button>
                </li>
                <li>
                  <Link href="/legal" className="hover:text-[#2563EB] transition-colors">
                    Legal Notice
                  </Link>
                </li>
                <li>
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    {t('privacy')}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E5E7EB] pt-8 text-xs text-[#7C7373] md:flex-row">
          <p>© {new Date().getFullYear()} {t('rightsReserved')}</p>

          <div className="flex items-center gap-6">
            <LanguageSwitcher className="rounded-lg pl-3 pr-8 py-1.5 focus:border-[#2563EB] focus:ring-1" />
            <span>{t('madeWithLove')}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
