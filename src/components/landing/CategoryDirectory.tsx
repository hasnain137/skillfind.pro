'use client';

import { Container } from "@/components/ui/Container";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface Subcategory {
  id: string;
  nameEn: string;
  slug: string;
}

interface Category {
  id: string;
  nameEn: string;
  slug: string;
  subcategories: Subcategory[];
}

interface CategoryDirectoryProps {
  categories?: Category[];
}

function CategoryColumn({ category }: { category: Category }) {
  const subcategories = category.subcategories || [];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#333333] uppercase tracking-wide">
        {category.nameEn}
      </h3>
      {subcategories.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {subcategories.map((sub) => (
            <li key={sub.id}>
              <Link
                href={`/search?subcategory=${sub.id}`}
                className="group flex items-center justify-between rounded-lg p-2 text-sm text-[#7C7373] transition-all hover:bg-gray-50 hover:text-primary hover:pl-3"
              >
                <span>{sub.nameEn}</span>
                <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 italic px-2">No subcategories yet</p>
      )}
    </div>
  );
}

export function CategoryDirectory({ categories = [] }: CategoryDirectoryProps) {
  const t = useTranslations('CategoryDirectory');

  // Show all provided categories, sorted by:
  // 1. Has subcategories (first) vs No subcategories (last)
  // 2. Alphabetical by nameEn
  const activeCategories = [...categories].sort((a, b) => {
    const aHasSubs = a.subcategories && a.subcategories.length > 0;
    const bHasSubs = b.subcategories && b.subcategories.length > 0;

    if (aHasSubs && !bHasSubs) return -1;
    if (!aHasSubs && bHasSubs) return 1;

    return a.nameEn.localeCompare(b.nameEn);
  });

  return (
    <section id="categories" className="py-20 md:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-[#3B4D9D]">
            {t('badge')}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#333333] md:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-[#7C7373] max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Category columns */}
        {activeCategories.length > 0 ? (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map((category) => (
              <CategoryColumn key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8 italic">
            No categories have been set up yet.
          </div>
        )}
      </Container>
    </section>
  );
}
