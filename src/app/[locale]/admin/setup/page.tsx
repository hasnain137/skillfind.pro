'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { toast } from 'sonner';

export default function AdminSetupPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<{ enCount: number, totalCount: number } | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/translations'); // We need a GET endpoint for stats or list
            if (res.ok) {
                const data = await res.json();
                // If API returns a map or list, calculate stats
                // Assuming data is Record<string, string> or list
                // If the list endpoint returns ALL translations, it might be heavy.
                // Better to have a stats endpoint?
                // For now, let's assume we can fetch list.
                // Actually, let's use the 'seed' endpoint logic response? 
                // Or just trust the user knows.
                // Let's rely on standard list if it exists.
                // If /api/admin/translations returns { translations: []... }
                // Let's handle generic list response.

                // Temporary: just show "Connected" if distinct endpoint works
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch on mount?
    useEffect(() => {
        setIsLoading(false); // mock for now
    }, []);

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            const res = await fetch('/api/admin/translations/seed', {
                method: 'POST',
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed');

            toast.success(`Success! Added ${data.data.count} keys.`);
            // Refresh stats...
        } catch (error) {
            toast.error('Seeding failed: ' + (error as Error).message);
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#333333]">System Setup</h1>
                    <p className="text-sm text-[#7C7373]">Configure core system parameters.</p>
                </div>
            </div>

            <Card padding="lg" className="space-y-4">
                <SectionHeading
                    title="Translation System"
                    description="Initialize the database with default language keys."
                />

                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <p className="text-sm text-blue-800">
                        <strong>Status:</strong> Use the button below to ensure all English keys from <code>messages/en.json</code>
                        are present in the database. This is required before auto-translating to other languages.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleSeed}
                        disabled={isSeeding}
                        className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4FD8] disabled:opacity-50 transition-colors"
                    >
                        {isSeeding ? 'Seeding...' : 'Seed Default Translations'}
                    </button>

                    <button
                        onClick={() => window.location.href = '/admin/translations'}
                        className="inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#333333] hover:bg-gray-50 transition-colors"
                    >
                        Manage Translations
                    </button>
                </div>
            </Card>

            <Card padding="lg" className="space-y-4">
                <SectionHeading
                    title="AI Configuration"
                    description="Manage API keys for auto-translation."
                />
                <div className="text-sm text-[#7C7373]">
                    API Keys are currently managed via <code>OPENAI_API_KEY</code> environment variable or System Database settings.
                </div>
            </Card>
        </div>
    );
}
