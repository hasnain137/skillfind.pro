'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

interface NavbarLinksProps {
    links: {
        href: string;
        label: string;
    }[];
}

export function NavbarLinks({ links }: NavbarLinksProps) {
    const [activeSection, setActiveSection] = useState<string>('');

    useEffect(() => {
        // Only run on client side and if we are on the homepage
        if (window.location.pathname !== '/' && window.location.pathname !== '/en' && window.location.pathname !== '/fr') {
            setActiveSection('');
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-20% 0px -60% 0px', // Adjusted to trigger earlier near top
                threshold: 0
            }
        );

        links.forEach((link) => {
            const id = link.href.split('#')[1];
            if (id) {
                const element = document.getElementById(id);
                if (element) observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [links]);

    return (
        <nav className="hidden items-center gap-1 text-sm font-medium text-[#7C7373] md:flex">
            {links.map((link) => {
                const id = link.href.split('#')[1];
                const isActive = activeSection === id;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`relative px-4 py-2 transition-colors duration-200 rounded-full ${isActive
                            ? 'text-[#3B4D9D] font-semibold bg-[#EFF6FF]'
                            : 'hover:text-[#333333] hover:bg-gray-50'
                            }`}
                        onClick={(e) => {
                            // If it's an anchor link, we might want to smoothen the scroll or just let default behavior work.
                            // Generally default behavior + CSS smooth-scroll is enough.
                            if (id) setActiveSection(id);
                        }}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
