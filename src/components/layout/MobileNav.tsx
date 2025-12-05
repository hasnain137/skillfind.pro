// src/components/layout/MobileNav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg text-[#7C7373] hover:bg-[#F3F4F6] focus:outline-none"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <div className="relative h-4 w-5">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="absolute left-0 top-0 h-0.5 w-5 bg-current transition-colors"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="absolute left-0 top-[7px] h-0.5 w-5 bg-current transition-colors"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="absolute left-0 bottom-0 h-0.5 w-5 bg-current transition-colors"
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={closeMenu}
              aria-hidden="true"
            />

            {/* Mobile Menu Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-[85vw] max-w-sm bg-white/90 backdrop-blur-3xl shadow-2xl border-l border-white/50 supports-[backdrop-filter]:bg-white/60"
            >
              <div className="flex h-16 items-center justify-between border-b border-[#E5E7EB] px-4">
                <span className="text-lg font-semibold text-slate-900">Menu</span>
                <button
                  onClick={closeMenu}
                  className="rounded-full p-2 text-[#7C7373] hover:bg-[#F3F4F6] focus:outline-none"
                  aria-label="Close menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1 p-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${pathname === link.href
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
