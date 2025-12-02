'use client';

import { SignUp } from '@clerk/nextjs';
import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ClientNavbar />
      <main className="flex-1 bg-[#FAFAFA] py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-md">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
                Join SkillFind
              </h1>
              <p className="mt-2 text-sm text-[#7C7373]">
                Create your account to get started
              </p>
            </div>

            {/* Clerk SignUp Component */}
            <div className="flex justify-center">
              <SignUp
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white to-[#2563EB0D] shadow-sm shadow-[#E5E7EB]/40",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border-[#E5E7EB] bg-white hover:bg-gray-50",
                    formButtonPrimary: "bg-[#2563EB] hover:bg-[#1D4FD8]",
                    footerActionLink: "text-[#2563EB] hover:text-[#1D4FD8]",
                  },
                }}
                routing="path"
                path="/signup"
                signInUrl="/login"
                afterSignUpUrl="/auth-redirect"
              />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
