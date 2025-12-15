'use client';

import { useParams } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export default function LoginPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  return (
    <div className="flex min-h-screen flex-col">
      <ClientNavbar />
      <main className="flex-1 bg-surface-50 py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-md">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-surface-900 md:text-3xl">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-surface-600">
                Sign in to your SkillFind account
              </p>
            </div>

            {/* Clerk SignIn Component */}
            <div className="flex justify-center">
              <SignIn
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "rounded-2xl border border-surface-200 bg-gradient-to-br from-white to-primary-50/10 shadow-soft",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border-surface-200 bg-white hover:bg-surface-50 text-surface-600",
                    formButtonPrimary: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md transition-all",
                    footerActionLink: "text-primary-600 hover:text-primary-700 font-medium",
                    formFieldLabel: "text-surface-700 font-medium",
                    formFieldInput: "border-surface-200 focus:border-primary-500 focus:ring-primary-500/20",
                    dividerLine: "bg-surface-200",
                    dividerText: "text-surface-400",
                  },
                }}
                routing="path"
                path={`/${locale}/login`}
                signUpUrl={`/${locale}/signup`}
                afterSignInUrl={`/${locale}/auth-redirect`}
              />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
