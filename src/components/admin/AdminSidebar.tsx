'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAVIGATION = [
    { name: 'Overview', href: '/admin', icon: '📊' },
    { name: 'Professionals', href: '/admin/professionals', icon: '👨‍💼' },
    { name: 'Clients', href: '/admin/clients', icon: '👥' },
    { name: 'Categories', href: '/admin/categories', icon: '📂' },
    { name: 'Reviews', href: '/admin/reviews', icon: '⭐' },
    { name: 'Transactions', href: '/admin/financials/transactions', icon: '💰' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r border-surface-200 bg-surface-50">
            <div className="flex h-16 items-center border-b border-surface-200 px-6">
                <span className="text-lg font-bold text-surface-900">Admin Panel</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAVIGATION.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
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
                    ← Back to Site
                </Link>
            </div>
        </div>
    );
}
