// src/components/landing/CategoryDirectory.tsx
'use client';

import { Container } from "@/components/ui/Container";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

// Define keys to look up in translation file
// We keep structure but values are keys
const CATEGORY_KEYS = [
  {
    nameKey: "tutoring",
    items: [
      "math", "science", "language", "exam", "school", "uni"
    ]
  },
  {
    nameKey: "tech",
    items: [
      "web", "bug", "app", "scripts", "techSupport", "db"
    ]
  },
  {
    nameKey: "design",
    items: [
      "logo", "ui", "presentation", "social", "photo", "illustration"
    ]
  },
  {
    nameKey: "business",
    items: [
      "cv", "linkedin", "career", "consulting", "pitch", "interview"
    ]
  },
  {
    nameKey: "wellness",
    items: [
      "fitness", "nutrition", "yoga", "mental", "lifestyle", "rehab"
    ]
  },
  {
    nameKey: "home",
    items: [
      "cleaning", "moving", "handyman", "furniture", "organization", "pet"
    ]
  }
];

function CategoryColumn({ nameKey, items }: { nameKey: string, items: string[] }) {
  const tCat = useTranslations('CategoryDirectory.Categories');
  const tItems = useTranslations('CategoryDirectory.Items');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[#333333] uppercase tracking-wide">
        {tCat(nameKey)}
      </h3>
      <ul className="flex flex-col gap-2">
        {items.map((itemKey) => {
          const itemLabel = tItems(itemKey);
          return (
            <li key={itemKey}>
              <Link
                href={`/search?q=${encodeURIComponent(itemLabel)}`}
                className="group flex items-center justify-between rounded-lg p-2 text-sm text-[#7C7373] transition-all hover:bg-[#F3F4F6] hover:text-[#2563EB] hover:pl-3"
              >
                <span>{itemLabel}</span>
                <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CategoryDirectory() {
  const t = useTranslations('CategoryDirectory');

  return (
    <section className="py-20 md:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
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
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_KEYS.map((group) => (
            <CategoryColumn key={group.nameKey} {...group} />
          ))}
        </div>
      </Container>
    </section>
  );
}
