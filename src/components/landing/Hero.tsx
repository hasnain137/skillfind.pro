// src/components/landing/Hero.tsx
import { Container } from "@/components/ui/Container";
import { SearchCard } from "./SearchCard";
import { LiveStats } from "./LiveStats";

export function Hero() {
  return (
    <section className="relative border-b border-[#E5E7EB] bg-gradient-to-b from-[#FAFAFA] via-[#FAFAFA] to-white pb-16 pt-10 md:pt-16 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.04)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(37,99,235,0.03)_0%,transparent_50%)]" />
      
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2563EB] animate-fade-in">
            Find trusted professionals in any field
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#333333] md:text-4xl lg:text-5xl animate-fade-in-up">
            Get the right help for any skill, in your language.
          </h1>
          <p className="mt-4 text-sm text-[#7C7373] md:text-base max-w-2xl mx-auto animate-fade-in-up-delay">
            Tutors, coaches, wellness experts, developers, designers, home
            services and more — verified and reviewed, online or near you.
          </p>
        </div>

        <SearchCard />
        
        {/* Live Stats Ticker */}
        <LiveStats />

      </Container>
    </section>
  );
}
