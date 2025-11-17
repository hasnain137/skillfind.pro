// src/components/landing/Hero.tsx
import { Container } from "@/components/ui/Container";
import { SearchCard } from "./SearchCard";

export function Hero() {
  return (
    <section className="border-b border-[#E5E7EB] bg-[#FAFAFA] pb-16 pt-10 md:pt-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7C7373]">
            Find trusted professionals in any field
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#333333] md:text-4xl lg:text-5xl">
            Get the right help for any skill, in your language.
          </h1>
          <p className="mt-4 text-sm text-[#7C7373] md:text-base">
            Tutors, coaches, wellness experts, developers, designers, home
            services and more — verified and reviewed, online or near you.
          </p>
        </div>

        <SearchCard />

      </Container>
    </section>
  );
}
