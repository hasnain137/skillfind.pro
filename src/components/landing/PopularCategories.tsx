// src/components/landing/PopularCategories.tsx
import { Container } from "@/components/ui/Container";

type Category = {
  name: string;
  description: string;
  icon: string;
};

// Default fallback categories for when database is unavailable
const FALLBACK_CATEGORIES: Category[] = [
  {
    name: "Tutoring & Education",
    description: "Math, languages, exam prep, school support and more.",
    icon: "📚",
  },
  {
    name: "Software & Tech",
    description: "Websites, apps, bugs, automation, and technical support.",
    icon: "💻",
  },
  {
    name: "Design & Creative",
    description: "Logos, branding, UI/UX, graphics, and visual identities.",
    icon: "🎨",
  },
  {
    name: "Health & Wellness",
    description: "Fitness, nutrition, mental wellbeing, and personal coaching.",
    icon: "🧘‍♀️",
  },
  {
    name: "Home & Repairs",
    description: "Cleaning, moving, handyman work, and small repairs.",
    icon: "🏠",
  },
  {
    name: "Business & Coaching",
    description: "Career advice, CVs, consulting, and business strategy.",
    icon: "📈",
  },
];

function CategoryCard({ name, description, icon, id }: Category & { id?: string }) {
  const searchUrl = id ? `/search?category=${id}` : '/search';
  
  return (
    <a 
      href={searchUrl}
      className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm shadow-[#E5E7EB]/40 transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-xl">
          <span>{icon}</span>
        </div>
        <h3 className="text-sm font-semibold text-[#333333]">{name}</h3>
      </div>
      <p className="text-xs leading-relaxed text-[#7C7373]">{description}</p>
      <span className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-[#2563EB]">
        Explore
        <span aria-hidden>→</span>
      </span>
    </a>
  );
}

interface DatabaseCategory {
  id: string;
  nameEn: string;
  nameFr: string | null;
  description: string | null;
  icon: string | null;
  slug: string;
}

interface PopularCategoriesProps {
  categories?: DatabaseCategory[];
}

// Map database categories to display format
function mapDatabaseCategories(dbCategories: DatabaseCategory[]): (Category & { id: string })[] {
  return dbCategories.map((cat) => ({
    id: cat.id,
    name: cat.nameEn, // Use English name as default
    description: cat.description || "Explore this category",
    icon: cat.icon || "🔧", // default icon
  }));
}

export function PopularCategories({ categories = [] }: PopularCategoriesProps) {
  return (
    <section
      id="categories"
      className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-12 md:py-16"
    >
      <Container>
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7C7373]">
            Popular categories
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#333333] md:text-3xl">
            Find the right expert faster by starting with a category.
          </h2>
          <p className="mt-3 text-sm text-[#7C7373] md:text-base">
            Whether you need help with school, your career, your home, or your
            next big idea, SkillFind connects you with verified professionals in
            the right category.
          </p>
        </div>

        {/* Category grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(categories.length > 0 
            ? mapDatabaseCategories(categories).slice(0, 6)
            : FALLBACK_CATEGORIES
          ).map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </Container>
    </section>
  );
}
