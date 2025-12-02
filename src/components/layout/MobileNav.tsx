// src/components/layout/MobileNav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const links = [
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/#categories', label: 'Categories' },
    { href: '/#top-professionals', label: 'Top professionals' },
    { href: '/#for-professionals', label: 'For professionals' },
    { href: '/search', label: 'Find Professionals' },
  ];

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-[#7C7373] hover:bg-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          // Close icon
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger icon
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#E5E7EB] px-4">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={closeMenu}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7C7373] hover:bg-[#F3F4F6]"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-[#2563EB]/10 text-[#2563EB]'
                  : 'text-[#7C7373] hover:bg-[#F3F4F6] hover:text-[#333333]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Language Selector */}
          <div className="mt-4 border-t border-[#E5E7EB] pt-4">
            <label className="mb-2 block text-xs font-medium text-[#7C7373]">Language</label>
            <select
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#7C7373]"
              defaultValue="en"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </nav>
      </div>
    </div>
  );
}
