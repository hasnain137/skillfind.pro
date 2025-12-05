// src/components/landing/DualCTA.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from 'next/link';

export function DualCTA() {
  return (
    <section id="for-professionals" className="py-20 md:py-24 bg-white">
      <Container>
        <div className="grid gap-8 md:grid-cols-2">

          {/* Client CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-[#333333] p-8 md:p-12 text-center md:text-left">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="relative z-10 flex flex-col h-full items-start">
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20 mb-6">
                For Clients
              </span>
              <h3 className="text-3xl font-bold text-white mb-4">
                Need help with a project?
              </h3>
              <p className="text-gray-300 mb-8 max-w-sm leading-relaxed">
                Find trusted professionals for any task. From tutoring to home repairs, we have you covered.
              </p>
              <Link href="/search" className="mt-auto">
                <Button className="bg-white text-[#333333] hover:bg-gray-100 border-none font-bold px-8">
                  Find a Professional
                </Button>
              </Link>
            </div>
          </div>

          {/* Professional CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 md:p-12 text-center md:text-left">
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col h-full items-start">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20 mb-6">
                For Professionals
              </span>
              <h3 className="text-3xl font-bold text-white mb-4">
                Grow your business
              </h3>
              <p className="text-blue-100 mb-8 max-w-sm leading-relaxed">
                Join 5,000+ experts receiving quality leads daily. Set your rates and work on your terms.
              </p>
              <Link href="/signup" className="mt-auto">
                <Button className="bg-[#333333] text-white hover:bg-gray-800 border-none font-bold px-8">
                  Join as a Pro
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
