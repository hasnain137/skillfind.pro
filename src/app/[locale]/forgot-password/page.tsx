'use client';

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth.forgotPassword');

  return (
    <div className="flex min-h-screen flex-col">
      <ClientNavbar />
      <main className="flex-1 bg-[#FAFAFA] py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-md">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-2 text-sm text-[#7C7373]">
                {t('subtitle')}
              </p>
            </div>

            {/* Reset Card */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white to-[#2563EB0D] p-6 shadow-sm shadow-[#E5E7EB]/40 md:p-8">
              <form className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium text-[#7C7373]"
                  >
                    {t('emailLabel')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full px-5 py-2.5 text-sm"
                >
                  {t('submit')}
                </Button>
              </form>
            </div>

            {/* Back to login */}
            <p className="mt-6 text-center text-xs text-[#7C7373]">
              {t('rememberPassword')}{" "}
              <Link
                href="/login"
                className="font-semibold text-[#2563EB] hover:text-[#1D4FD8]"
              >
                {t('signIn')}
              </Link>
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

