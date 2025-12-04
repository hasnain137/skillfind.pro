'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SearchFilters } from './SearchFilters';

export function MobileFilterDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="w-full justify-center gap-2"
        >
          <span>⚙️</span> Filters
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <SearchFilters />
                </div>

                <div className="border-t p-4">
                  <Button onClick={() => setIsOpen(false)} className="w-full justify-center">
                    Show Results
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
