// src/app/pro/layout.tsx
import type { Metadata } from "next";
import { Link } from '@/i18n/routing';
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ClientUserButton } from "@/components/layout/ClientUserButton";
import { MobileDashboardNav } from "@/components/layout/MobileDashboardNav";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Professional Area | SkillFind",
  description:
    "Manage your SkillFind professional profile, matching requests, and offers.",
};

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('Sidebar.Pro');

  const SIDEBAR_LINKS = [
    { label: t('links.dashboard'), href: "/pro", icon: "🏠" },
    { label: t('links.matchingRequests'), href: "/pro/requests", icon: "🔍" },
    { label: t('links.myOffers'), href: "/pro/offers", icon: "📤" },
    { label: t('links.myJobs'), href: "/pro/jobs", icon: "💼" },
    { label: t('links.myProfile'), href: "/pro/profile", icon: "👤" },
    { label: t('links.wallet'), href: "/pro/wallet", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] bg-mesh-gradient pb-20 lg:pb-0">

      {/* Desktop Sidebar - Fixed Left */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#0F172A] to-[#3B4D9D] text-white p-6 shadow-2xl border-r border-white/5">

        {/* Header / Brand */}
        <div className="mb-8 px-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">SkillFind</h2>
            <p className="text-sm text-white/60 font-medium">Professional Dashboard</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2">
          <div className="mb-6">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Menu</p>
            <SidebarNav links={SIDEBAR_LINKS} variant="dark" />
          </div>

          {/* Description text from translation */}

        </div>

        {/* Sidebar Footer - Back to Home */}
        <div className="mt-auto pt-6 border-t border-white/10 px-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-72 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200 px-8 py-4 flex items-center justify-end gap-4">
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            <ClientUserButton />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-4 py-8 lg:p-10 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileDashboardNav links={SIDEBAR_LINKS} />
    </div>
  );
}
