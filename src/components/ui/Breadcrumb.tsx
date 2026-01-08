// src/components/ui/Breadcrumb.tsx
import { Link } from '@/i18n/routing';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-2">
                    {index > 0 && (
                        <span className="text-[#D1D5DB]">/</span>
                    )}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-[#7C7373] hover:text-[#2563EB] transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-[#333333] font-medium truncate max-w-[200px]">
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    );
}
