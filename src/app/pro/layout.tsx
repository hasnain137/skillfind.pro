import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ClientUserButton } from "@/components/layout/ClientUserButton";
import { Navbar } from "@/components/layout/Navbar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { MobileDashboardNav } from "@/components/layout/MobileDashboardNav";

export const metadata: Metadata = {
  title: "Professional Area | SkillFind",
  description:
    "Manage your SkillFind professional profile, matching requests, and offers.",
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/pro", icon: "🏠" },
  { label: "Requests", href: "/pro/requests", icon: "🔍" },
  { label: "Offers", href: "/pro/offers", icon: "📤" },
  { label: "Jobs", href: "/pro/jobs", icon: "💼" },
  { label: "Wallet", href: "/pro/wallet", icon: "💰" },
];

// Separate full nav links for sidebar (includes profile)
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
  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20 lg:pb-0">
      <Navbar />
      <div className="py-6 lg:py-10">
        <Container className="flex flex-col gap-6 lg:flex-row">
          {/* Desktop Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block rounded-2xl border border-[#DDE7FF] bg-gradient-to-b from-white via-[#F7FAFF] to-[#EEF2FF] p-5 shadow-sm lg:w-64">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C7373]">
                  Professional area
                </p>
                <h2 className="text-lg font-semibold text-[#333333]">
                  Manage your work
                </h2>
              </div>
              <ClientUserButton />
            </div>

            <SidebarNav links={SIDEBAR_LINKS} />

            <p className="mt-8 text-xs text-[#7C7373]">
              This space is for professionals to discover matching client
              requests, send offers, and manage their ongoing work.
            </p>
          </aside>

          <div className="flex-1">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 lg:p-6 shadow-sm">
              {children}
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileDashboardNav links={NAV_LINKS} />
    </div>
  );
}
