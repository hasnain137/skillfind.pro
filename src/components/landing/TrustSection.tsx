// src/components/landing/TrustSection.tsx
import { Container } from "@/components/ui/Container";

type Benefit = {
  title: string;
  description: string;
  icon: string;
};

const BENEFITS: Benefit[] = [
  {
    title: "The pros will contact you",
    description:
      "Tell us what you need, and verified professionals will send you personalised offers with pricing.",
    icon: "📄",
  },
  {
    title: "The best price",
    description:
      "Compare offers from different pros and choose the one that suits you best — by budget, timing, or reviews.",
    icon: "💰",
  },
  {
    title: "Verified professionals",
    description:
      "We ask all pros to verify their identity, work experience, and qualifications before they can respond to requests.",
    icon: "🏅",
  },
  {
    title: "Trusted reviews",
    description:
      "Clients can leave a review only after the work is done — and we carefully check every review to ensure authenticity.",
    icon: "⭐",
  },
];

function BenefitCard({ title, description, icon }: Benefit) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB]/10 text-2xl">
        <span>{icon}</span>
      </div>
      <h3 className="text-sm font-semibold text-[#333333]">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-[#7C7373]">
        {description}
      </p>
    </div>
  );
}

export function TrustSection() {
  return (
    <section className="border-b border-[#E5E7EB] bg-white py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            Trusted professionals, just one click away.
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            SkillFind is built to be fair for both clients and professionals:
            clear offers, verified profiles, and reviews you can rely on.
          </p>
        </div>

        <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-4">
          {BENEFITS.map((item) => (
            <BenefitCard key={item.title} {...item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
