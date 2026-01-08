
"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

// Phase 4: Dashboard Layout
// Fixed sidebar + scrollable content area
// Level 0 background for content, Level 1 (with border) for sidebar

interface DashboardLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    header?: React.ReactNode;
}

export function DashboardLayout({ children, sidebar, header }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-surface-50">
            {/* Sidebar - Hidden on mobile, fixed on desktop */}
            <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white md:flex">
                {sidebar}
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {header && (
                    <header className="flex h-16 items-center border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-sm">
                        {header}
                    </header>
                )}

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="mx-auto max-w-7xl animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
