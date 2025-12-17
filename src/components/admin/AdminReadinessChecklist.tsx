'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ReadinessItem {
    label: string;
    isComplete: boolean;
}

interface AdminReadinessChecklistProps {
    professionalId: string;
}

export function AdminReadinessChecklist({ professionalId }: AdminReadinessChecklistProps) {
    const [items, setItems] = useState<ReadinessItem[]>([]);
    const [canBeActive, setCanBeActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReadiness = async () => {
            try {
                const res = await fetch(`/api/admin/professionals/${professionalId}/readiness`);
                const data = await res.json();

                if (data.success && data.data) {
                    setCanBeActive(data.data.canBeActive);

                    // Map API response to UI items
                    const mappedItems: ReadinessItem[] = [];

                    // If we have explicit checklist from API, use it (though my implementation returned empty array mostly)
                    if (data.data.checklist && data.data.checklist.length > 0) {
                        setItems(data.data.checklist);
                    } else {
                        // Fallback: Use blocking reasons
                        const reasons = data.data.blockingReasons || [];
                        if (reasons.length === 0) {
                            mappedItems.push({ label: 'All requirements met', isComplete: true });
                        } else {
                            reasons.forEach((r: string) => mappedItems.push({ label: r, isComplete: false }));
                        }
                        setItems(mappedItems);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch readiness', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReadiness();
    }, [professionalId]);

    if (loading) return <div>Loading readiness check...</div>;

    return (
        <Card className="mb-6 border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Readiness Checklist</h3>
                    {canBeActive ?
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ready to Activate</Badge> :
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Not Ready</Badge>
                    }
                </div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                            <span>{item.isComplete ? '✅' : '❌'}</span>
                            <span className={item.isComplete ? 'text-gray-700' : 'text-red-600 font-medium'}>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
