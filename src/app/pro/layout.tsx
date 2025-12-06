// src/app/pro/layout.tsx
import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ClientUserButton } from "@/components/layout/ClientUserButton";

export const metadata: Metadata = {
  title: "Professional Area | SkillFind",
  description:
    "Manage your SkillFind professional profile, matching requests, and offers.",
};

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/pro", icon: "🏠" },
  { label: "Matching requests", href: "/pro/requests", icon: "🔍" },
  { label: "My offers", href: "/pro/offers", icon: "📤" },
  { label: "My jobs", href: "/pro/jobs", icon: "💼" },
  { label: "My profile", href: "/pro/profile", icon: "👤" },
  { label: "Wallet", href: "/pro/wallet", icon: "💰" },
];

export default function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <span className="text-lg font-bold tracking-tight text-surface-900">SkillFind<span className="text-primary-600">Pro</span></span>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <SidebarNav links={SIDEBAR_LINKS} />
      </div>
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3">
          <ClientUserButton />
          <div className="text-xs">
            <p className="font-medium text-surface-900">My Account</p>
            <p className="text-surface-500">Manage settings</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout sidebar={SidebarContent}>
      {children}
    </DashboardLayout>
  );
}
