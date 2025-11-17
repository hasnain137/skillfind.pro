// src/components/landing/HowItWorks.tsx
import { Container } from "@/components/ui/Container";

type StepProps = {
  number: string;
  title: string;
  description: string;
};

function StepCard({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-white to-[#2563EB0D] p-5 shadow-sm shadow-[#E5E7EB]/40 transition hover:shadow-md">
      
      {/* Step badge */}
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB]/10">
          {number}
        </div>
        <span className="uppercase tracking-[0.16em] text-[10px] text-[#7C7373]">
          Step {number}
        </span>
      </div>

      {/* Step content */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[#333333]">{title}</h3>
        <p className="text-xs leading-relaxed text-[#7C7373]">
          {description}
        </p>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-12 md:py-16"
    >
      <Container>
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C7373]">
            How SkillFind works
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            Post what you need, get offers, choose the right professional.
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            Instead of scrolling through hundreds of profiles, you describe your
            task once and let the right professionals come to you.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3">
          <StepCard
            number="1"
            title="Create a request in seconds"
            description="Tell us what you need, your budget, and whether you prefer online or in-person. Your request is shared only with relevant professionals."
          />
          <StepCard
            number="2"
            title="Get offers from verified pros"
            description="Matching professionals can send you short offers with a price estimate and availability. You see their profiles, reviews, and experience at a glance."
          />
          <StepCard
            number="3"
            title="Choose, contact & leave a review"
            description="Pick the professional that fits you best and contact them directly. After the job, leave a review to help other clients and reward good work."
          />
        </div>
      </Container>
    </section>
  );
}
