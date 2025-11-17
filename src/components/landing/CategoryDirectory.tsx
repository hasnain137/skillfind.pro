// src/components/landing/CategoryDirectory.tsx
import { Container } from "@/components/ui/Container";

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
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[#333333]">{name}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              className="text-xs text-[#7C7373] hover:text-[#2563EB]"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CategoryDirectory() {
  return (
    <section className="border-b border-[#E5E7EB] bg-white py-12 md:py-16">
      <Container>
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C7373]">
            Browse all categories
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            Explore everything you can find on SkillFind.
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            From tutoring and tech to fitness, design, and home help —
            SkillFind brings all kinds of professionals together in one place.
          </p>
        </div>

        {/* Category columns */}
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_GROUPS.map((group) => (
            <CategoryColumn key={group.name} {...group} />
          ))}
        </div>
      </Container>
    </section>
  );
}
