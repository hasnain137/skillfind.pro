// src/components/admin/AdminSidebar.tsx
'use client';

import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function AdminSidebar() {
    const pathname = usePathname();
    const t = useTranslations('Components.AdminSidebar');

    const NAVIGATION = [
        { name: t('links.overview'), href: '/admin', icon: '📊' },
        { name: t('links.professionals'), href: '/admin/professionals', icon: '👨‍💼' },
        { name: t('links.clients'), href: '/admin/clients', icon: '👥' },
        { name: t('links.categories'), href: '/admin/categories', icon: '📂' },
        { name: t('links.reviews'), href: '/admin/reviews', icon: '⭐' },
        { name: t('links.translations'), href: '/admin/translations', icon: '🌐' },
        { name: t('links.transactions'), href: '/admin/financials/transactions', icon: '💰' },
        { name: t('links.settings'), href: '/admin/settings', icon: '⚙️' },
    ];

    return (
        <div className="flex h-full w-64 flex-col border-r border-surface-200 bg-surface-50">
            <div className="flex h-16 items-center border-b border-surface-200 px-6">
                <span className="text-lg font-bold text-surface-900">{t('title')}</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAVIGATION.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                                isActive
                                    ? 'bg-primary-50 text-primary-900 font-semibold'
                                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                            )}
                        >
                            <span className="mr-3 text-lg opacity-80">{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-surface-200 p-4">
                <Link href="/" className="text-xs text-surface-500 hover:text-surface-900 transition-colors">
                    {t('backToSite')}
                </Link>
            </div>
        </div>
    );
}
