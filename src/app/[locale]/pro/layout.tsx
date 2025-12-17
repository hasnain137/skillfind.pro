// src/app/pro/layout.tsx
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Navbar } from "@/components/layout/Navbar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ClientUserButton } from "@/components/layout/ClientUserButton";
import { MobileDashboardNav } from "@/components/layout/MobileDashboardNav";
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
    <div className="min-h-screen bg-[#F3F4F6] pb-20 lg:pb-0">
      <Navbar />
      <div className="py-6 lg:py-10">
        <Container className="flex flex-col gap-6 lg:flex-row">
          {/* Desktop Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block rounded-2xl border border-[#DDE7FF] bg-gradient-to-b from-white via-[#F7FAFF] to-[#EEF2FF] p-5 shadow-sm lg:w-64 h-fit sticky top-24">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C7373]">
                  {t('eyebrow')}
                </p>
                <h2 className="text-lg font-semibold text-[#333333]">
                  {t('title')}
                </h2>
              </div>
              <ClientUserButton />
            </div>

            <SidebarNav links={SIDEBAR_LINKS} />

            <div className="mt-8 pt-4 border-t border-[#E5E7EB]">
              <p className="text-xs text-[#7C7373]">
                {t('description')}
              </p>
            </div>
          </aside>

          <div className="flex-1">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 lg:p-6 shadow-sm min-h-[600px]">
              {children}
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileDashboardNav links={SIDEBAR_LINKS} />
    </div>
  );
}
