// src/components/landing/CategoryDirectory.tsx
'use client';

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { useTranslations } from 'next-intl';

type CategoryGroup = {
  nameKey: string;
  items: string[];
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    nameKey: "tutoring",
    items: [
      "Math tutoring",
      "Science tutoring",
      "Language tutoring",
      "Exam preparation",
      "School support",
      "University subjects",
    ],
  },
  {
    nameKey: "tech",
    items: [
      "Website development",
      "Bug fixing & troubleshooting",
      "App development",
      "Automation & scripts",
      "Tech support",
      "Database help",
    ],
  },
  {
    nameKey: "design",
    items: [
      "Logo & brand design",
      "UI/UX design",
      "Presentation design",
      "Social media visuals",
      "Photo editing",
      "Illustration",
    ],
  },
  {
    nameKey: "business",
    items: [
      "CV & resume review",
      "LinkedIn profile help",
      "Career coaching",
      "Business consulting",
      "Pitch deck help",
      "Interview preparation",
    ],
  },
  {
    nameKey: "health",
    items: [
      "Fitness coaching",
      "Nutrition guidance",
      "Yoga & pilates",
      "Mental wellbeing support",
      "Lifestyle coaching",
      "Rehabilitation exercises",
    ],
  },
  {
    nameKey: "home",
    items: [
      "Cleaning services",
      "Moving & packing help",
      "Handyman services",
      "Furniture assembly",
      "Home organisation",
      "Pet care & walking",
    ],
  },
];

function CategoryColumn({ nameKey, items }: CategoryGroup) {
  const t = useTranslations('Landing.CategoryDirectory.groups');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#333333] uppercase tracking-wide">{t(nameKey)}</h3>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item}>
            <Link
              href={`/search?q=${encodeURIComponent(item)}`}
              className="group flex items-center justify-between rounded-lg p-2 text-sm text-[#7C7373] transition-all hover:bg-[#F3F4F6] hover:text-[#2563EB] hover:pl-3"
            >
              <span>{item}</span>
              <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CategoryDirectory() {
  const t = useTranslations('Landing.CategoryDirectory');

  return (
    <section className="py-20 md:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
            {t('eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#333333] md:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-[#7C7373] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Category columns */}
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_GROUPS.map((group) => (
            <CategoryColumn key={group.nameKey} {...group} />
          ))}
        </div>
      </Container>
    </section>
  );
}
