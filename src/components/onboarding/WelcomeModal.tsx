'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface WelcomeModalProps {
    userRole: 'CLIENT' | 'PROFESSIONAL';
    firstName: string;
}

export function WelcomeModal({ userRole, firstName }: WelcomeModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user has seen welcome modal
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenWelcome', 'true');
    };

    const handleAction = () => {
        handleClose();
        if (userRole === 'CLIENT') {
            router.push('/client/requests/new');
        } else {
            router.push('/pro/profile');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
                                👋
                            </div>
                        </div>

                        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
                            Welcome, {firstName}!
                        </h2>

                        <p className="mb-8 text-center text-gray-500">
                            {userRole === 'CLIENT'
                                ? "Ready to find the perfect professional? Post your first request to get started."
                                : "Ready to grow your business? Complete your profile to start getting matched with jobs."}
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button onClick={handleAction} className="w-full justify-center py-3 text-base">
                                {userRole === 'CLIENT' ? "Post a Request" : "Complete Profile"}
                            </Button>
                            <button
                                onClick={handleClose}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
