// src/components/layout/Footer.tsx
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export async function Footer() {
  const t = await getTranslations('Landing.Footer');

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
              {t('tagline')}
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
                    {t('browse')}
                  </Link>
                </li>
                <li>
                  <Link href="/#top-professionals" className="hover:text-[#2563EB] transition-colors">
                    {t('featured')}
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-[#2563EB] transition-colors">
                    {t('howItWorks')}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">
                {t('forPros')}
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
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    {t('terms')}
                  </button>
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
          <p>{t('rights', { year: new Date().getFullYear() })}</p>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <span>{t('madeWithLove')}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
