'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";

interface AdminReadinessChecklistProps {
    professionalId: string;
}

interface ChecklistItem {
    label: string;
    isComplete: boolean;
}

export function AdminReadinessChecklist({ professionalId }: AdminReadinessChecklistProps) {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [canBeActive, setCanBeActive] = useState(false);

    useEffect(() => {
        // We need a server action or API route to get this data calculated on the fly
        // For now, I'll assume we can fetch it from the same profile completion endpoint or a new one
        async function fetchReadiness() {
            // NOTE: This usually requires a specific Admin API to get detailed stats
            // I will implement a quick server action pattern or API call here
            try {
                const res = await fetch(`/api/admin/professionals/${professionalId}/readiness`);
                if (res.ok) {
                    const data = await res.json();
                    setItems(data.data.checklist);
                    setCanBeActive(data.data.canBeActive);
                }
            } catch (err) {
                console.error("Failed to fetch readiness", err);
            } finally {
                setLoading(false);
            }
        }
        fetchReadiness();
    }, [professionalId]);

    if (loading) return <div>Loading readiness check...</div>;

    return (
        <Card className="mb-6 border-l-4 border-l-purple-500">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Readiness Checklist</h3>
                    {canBeActive ? <Badge variant="success">Ready</Badge> : <Badge variant="destructive">Not Ready</Badge>}
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
