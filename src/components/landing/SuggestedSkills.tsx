// src/components/landing/SuggestedSkills.tsx
import { Container } from "@/components/ui/Container";

const SUGGESTED_SKILLS = [
  "Math & exam prep",
  "Language tutoring",
  "CV & career coaching",
  "Frontend bug fixing",
  "Logo & brand design",
  "Fitness & nutrition",
  "Mental wellbeing support",
  "Home cleaning",
  "Moving & packing help",
  "Resume & LinkedIn review",
  "Website troubleshooting",
  "Social media support",
];

export function SuggestedSkills() {
  return (
    <section className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-10 md:py-14">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C7373]">
            Ideas to get started
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            Not sure what to search for?
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            Here are some common things people use SkillFind for. Tap a skill to
            explore professionals in that area.
          </p>
        </div>

        {/* Chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {SUGGESTED_SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              className="rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-xs font-medium text-[#333333] shadow-sm shadow-[#E5E7EB]/40 transition hover:border-[#2563EB] hover:text-[#2563EB] hover:shadow-md"
            >
              {skill}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
