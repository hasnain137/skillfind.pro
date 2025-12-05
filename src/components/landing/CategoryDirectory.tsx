// src/components/landing/CategoryDirectory.tsx
'use client';

import { Container } from "@/components/ui/Container";
import Link from "next/link";

type CategoryGroup = {
  name: string;
  items: string[];
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: "Tutoring & Education",
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
    name: "Software & Tech",
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
    name: "Design & Creative",
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
    name: "Business & Career",
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
    name: "Health & Wellness",
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
    name: "Home & Everyday",
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

function CategoryColumn({ name, items }: CategoryGroup) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[#333333] uppercase tracking-wide">{name}</h3>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item}>
            <Link
              href={`/search?q=${encodeURIComponent(item)}`}
              className="group flex items-center justify-between rounded-lg p-2 text-sm text-[#7C7373] transition-all hover:bg-slate-50 hover:text-blue-600 hover:pl-3"
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
  return (
    <section className="py-20 md:py-24 bg-white border-b border-slate-200">
      <Container>
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Browse all categories
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#333333] md:text-4xl">
            Explore everything on SkillFind.
          </h2>
          <p className="mt-4 text-lg text-[#7C7373] max-w-2xl mx-auto">
            From tutoring and tech to fitness, design, and home help —
            we bring all kinds of professionals together in one place.
          </p>
        </div>

        {/* Category columns */}
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_GROUPS.map((group) => (
            <CategoryColumn key={group.name} {...group} />
          ))}
        </div>
      </Container>
    </section>
  );
}
