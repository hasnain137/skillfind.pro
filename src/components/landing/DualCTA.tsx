// src/components/landing/DualCTA.tsx
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function DualCTA() {
  return (
    <section
      id="for-professionals"
      className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-16 md:py-20"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            Choose your path on SkillFind.
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            Whether you’re looking for help or offering your skills, SkillFind
            makes it simple and fair for everyone.
          </p>
        </div>

        {/* Two cards grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Client Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm shadow-[#E5E7EB]/40 border border-[#E5E7EB] bg-gradient-to-br from-white to-[#2563EB0A]">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-[#333333]">
              For Clients
            </h3>
            <p className="mt-2 text-sm text-[#7C7373] leading-relaxed">
              Find verified professionals for tutoring, design, tech help, home
              services, coaching and more.
            </p>
            <Button className="mt-4 w-full justify-center py-2.5 text-sm">
              Find professionals
            </Button>
          </div>

          {/* Professional Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm shadow-[#E5E7EB]/40 border border-[#E5E7EB] bg-gradient-to-br from-white to-[#2563EB0A]">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-lg font-semibold text-[#333333]">
              For Professionals
            </h3>
            <p className="mt-2 text-sm text-[#7C7373] leading-relaxed">
              Offer your skills, respond to client requests, and grow your
              business online or locally.
            </p>
            <Button className="mt-4 w-full justify-center py-2.5 text-sm">
              Become a professional
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
