// src/components/landing/PopularCategories.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { Stagger } from "@/components/ui/motion/Stagger";
import { FadeIn } from "@/components/ui/motion/FadeIn";
import { motion } from "framer-motion";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

type Category = {
  name: string;
  description: string;
  icon: string;
};

function CategoryCard({ name, description, icon, id }: Category & { id?: string }) {
  const searchUrl = id ? `/search?category=${id}` : '/search';

  return (
    <Link href={searchUrl} className="block h-full">
      <div className="group h-full p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        {/* Icon + Title Row */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-xl group-hover:bg-[#3B4D9D] transition-colors duration-200">
            {icon.startsWith('http') || icon.startsWith('/') ? (
              <img src={icon} alt={name} className="h-6 w-6 object-contain group-hover:scale-110 transition-transform" />
            ) : (
              <span className="group-hover:scale-110 transition-transform">{icon}</span>
            )}
          </div>
          <h3 className="text-base font-semibold text-[#333333] group-hover:text-[#3B4D9D] transition-colors">
            {name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-[#7C7373] leading-relaxed">{description}</p>
      </div>
    </Link>
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
  const t = useTranslations('PopularCategories');

  // Display up to 8 categories from the database
  const displayCategories = categories && categories.length > 0
    ? mapDatabaseCategories(categories).slice(0, 8)
    : [];

  return (
    <section id="categories" className="py-16 md:py-20 bg-[#FAFAFA] border-b border-[#E5E7EB]">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-12">
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-wider text-[#3B4D9D]">
              {t('badge')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tighter text-[#333333] md:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-[#7C7373] max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <Stagger className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {displayCategories.map((category) => (
            <motion.div key={category.name} variants={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}>
              <CategoryCard {...category} />
            </motion.div>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
