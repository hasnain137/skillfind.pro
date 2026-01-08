
"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

// Phase 4: Admin Layout
// Similar to Dashboard but might have a distinct header color or structure
// Using Level 1 Sidebar

interface AdminLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    header?: React.ReactNode;
}

export function AdminLayout({ children, sidebar, header }: AdminLayoutProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-zinc-50">
            {/* Sidebar */}
            <aside className="hidden w-72 flex-col border-r border-zinc-200 bg-white md:flex">
                {/* Dark sidebar for Admin distinction */}
                {sidebar}
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {header && (
                    <header className="flex h-16 items-center border-b border-zinc-200 bg-white px-6 shadow-sm">
                        {header}
                    </header>
                )}

                <main className="flex-1 overflow-auto bg-surface-50 p-6 md:p-10">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
