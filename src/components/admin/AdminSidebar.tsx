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
        <div className="flex h-full w-64 flex-col border-r border-[#E5E7EB] bg-white">
            <div className="flex h-16 items-center border-b border-[#E5E7EB] px-6">
                <span className="text-lg font-bold text-[#333333]">Admin Panel</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {NAVIGATION.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-blue-50 text-[#2563EB]'
                                    : 'text-[#4B5563] hover:bg-gray-50 hover:text-[#333333]'
                            )}
                        >
                            <span className="mr-3 text-lg">{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-[#E5E7EB] p-4">
                <Link href="/" className="text-xs text-[#7C7373] hover:text-[#333333]">
                    ← Back to Site
                </Link>
            </div>
        </div>
    );
}
