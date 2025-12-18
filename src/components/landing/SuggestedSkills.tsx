// src/components/landing/SuggestedSkills.tsx
import { Container } from "@/components/ui/Container";

import { useTranslations } from 'next-intl';

const SUGGESTED_SKILLS = [
  "mathExam",
  "languageTutoring",
  "careerCoaching",
  "frontendDebug",
  "brandDesign",
  "fitnessNutrition",
  "mentalWellbeing",
  "homeCleaning",
  "movingHelp",
  "resumeReview",
  "websiteTroubleshoot",
  "socialMedia",
];

export function SuggestedSkills() {
  const t = useTranslations('SuggestedSkills');

  return (
    <section className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-10 md:py-14">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7C7373]">
            {t('badge')}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            {t('subtitle')}
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
              {t(`skills.${skill}`)}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
