
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { ChangeEvent, useTransition } from 'react';

export function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();

    function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
        const nextLocale = event.target.value;
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    }

    return (
        <select
            className="hidden rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#7C7373] shadow-sm hover:border-[#D1D5DB] md:block cursor-pointer outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50"
            defaultValue={locale}
            onChange={onSelectChange}
            disabled={isPending}
        >
            <option value="en">EN</option>
            <option value="fr">FR</option>
        </select>
    );
}
