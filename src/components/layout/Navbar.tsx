// src/components/layout/Navbar.tsx
import { Container } from "@/components/ui/Container";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavbarLinks } from "./NavbarLinks";
import { auth } from "@clerk/nextjs/server";
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export async function Navbar() {
  const { userId } = await auth();
  const t = await getTranslations('Navbar');

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Left: Logo + language */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3B4D9D] text-xs font-bold text-white">
              SF
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Skill<span className="text-[#3B4D9D]">Find</span>
            </span>
          </Link>

          {/* Language/region dropdown */}
          {/* Language/region dropdown */}
          <LanguageSwitcher className="hidden md:block" />
        </div>

        {/* Middle: navigation (desktop only) */}
        <NavbarLinks
          links={[
            { href: '/#hero', label: t('home') },
            { href: '/#how-it-works', label: t('howItWorks') },
            { href: '/#categories', label: t('categories') },
            { href: '/#top-professionals', label: t('topProfessionals') },
            { href: '/#reviews', label: t('reviews') },
            { href: '/#trust', label: t('whyUs') },
          ]}
        />

        {/* Right: auth section */}
        <div className="flex items-center gap-2">
          {userId ? (
            // Show user menu when authenticated
            <UserMenu />
          ) : (
            // Show login/signup buttons when not authenticated
            <>
              <Link
                href="/login"
                className="hidden items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[#333333] transition hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E5E5E5] border border-transparent hover:border-[#E5E7EB] md:inline-flex"
              >
                {t('login')}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[#3B4D9D] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#3B4D9D]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B4D9D]"
              >
                {t('signup')}
              </Link>
            </>
          )}

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
