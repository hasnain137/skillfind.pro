// src/components/ui/CollapsibleTips.tsx
'use client';

import { useState } from 'react';
import { Card } from './Card';

interface Tip {
    title: string;
    description: string;
}

interface CollapsibleTipsProps {
    title?: string;
    tips: Tip[];
    defaultOpen?: boolean;
}

export function CollapsibleTips({
    title = "Tips",
    tips,
    defaultOpen = true
}: CollapsibleTipsProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 overflow-hidden" padding="none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 lg:p-5 text-left hover:bg-blue-50/50 transition-colors"
            >
                <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
                    <span>💡</span> {title}
                </h3>
                <span className={`text-[#7C7373] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            <div className={`
        grid transition-all duration-300 ease-in-out
        ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
      `}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 lg:px-5 lg:pb-5 grid gap-2 sm:grid-cols-2 text-sm text-[#7C7373]">
                        {tips.map((tip, index) => (
                            <p key={index}>
                                • <strong>{tip.title}:</strong> {tip.description}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
