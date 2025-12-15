// src/components/layout/ClientNavbar.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { useUser } from "@clerk/nextjs";
import { UserMenu } from "./UserMenu";
import { Link } from '@/i18n/routing';

export function ClientNavbar() {
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Left: Logo + language */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white">
              SF
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Skill<span className="text-[#2563EB]">Find</span>
            </span>
          </Link>

          {/* Language/region dropdown */}
          <select
            className="hidden rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#7C7373] shadow-sm hover:border-[#D1D5DB] md:block"
            defaultValue="en"
          >
            <option value="en">EN</option>
            <option value="de">DE</option>
            <option value="fr">FR</option>
          </select>
        </div>

        {/* Middle: navigation (desktop only) */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#7C7373] md:flex">
          <Link href="/#how-it-works" className="hover:text-[#333333]">
            How it works
          </Link>
          <Link href="/#categories" className="hover:text-[#333333]">
            Categories
          </Link>
          <Link href="/#top-professionals" className="hover:text-[#333333]">
            Top professionals
          </Link>
          <Link href="/#for-professionals" className="hover:text-[#333333]">
            For professionals
          </Link>
        </nav>

        {/* Right: auth section */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            // Show user menu when authenticated
            <UserMenu />
          ) : (
            // Show login/signup buttons when not authenticated
            <>
              <Link
                href="/login"
                className="hidden items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[#333333] transition hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E5E5E5] border border-transparent hover:border-[#E5E7EB] md:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4FD8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
