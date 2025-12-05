// src/components/landing/PopularCategories.tsx
import { Container } from "@/components/ui/Container";

type Category = {
  name: string;
  description: string;
  icon: string;
};

// Default fallback categories
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
      className="group flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
          <span>{icon}</span>
        </div>
        <h3 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{name}</h3>
      </div>
      <p className="text-sm text-surface-500 leading-relaxed">{description}</p>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-primary-600 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
        Explore Category <span aria-hidden>→</span>
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

function mapDatabaseCategories(dbCategories: DatabaseCategory[]): (Category & { id: string })[] {
  return dbCategories.map((cat) => ({
    id: cat.id,
    name: cat.nameEn,
    description: cat.description || "Explore this category",
    icon: cat.icon || "🔍",
  }));
}

export function PopularCategories({ categories }: PopularCategoriesProps) {
  const displayCategories = categories && categories.length > 0
    ? mapDatabaseCategories(categories).slice(0, 6)
    : FALLBACK_CATEGORIES;

  return (
    <section className="py-20 md:py-24 bg-surface-50 border-b border-surface-200">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-primary-600">
            Most In-Demand
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-surface-900 md:text-4xl">
            Popular services this week.
          </h2>
          <p className="mt-4 text-lg text-surface-500 max-w-2xl mx-auto">
            Find help for your daily needs or long-term projects.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCategories.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </Container>
    </section>
  );
}
