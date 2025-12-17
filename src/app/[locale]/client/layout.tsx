import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ClientUserButton } from "@/components/layout/ClientUserButton";
import { Navbar } from "@/components/layout/Navbar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { MobileDashboardNav } from "@/components/layout/MobileDashboardNav";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Client Dashboard | SkillFind",
  description: "Manage your service requests and professionals in one place.",
};

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // Verify that the user has a Client profile
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { clientProfile: true },
  });

  if (!user || !user.clientProfile) {
    // User exists in Clerk but not in DB, or has no client profile
    // Redirect to onboarding to complete setup
    redirect("/auth-redirect");
  }

  const t = await getTranslations('Sidebar.Client');

  const NAV_LINKS = [
    { label: t('links.dashboard'), href: "/client", icon: "🏠" },
    { label: t('links.requests'), href: "/client/requests", icon: "📝" },
    { label: t('links.jobs'), href: "/client/jobs", icon: "💼" },
    { label: t('links.new'), href: "/client/requests/new", icon: "➕" },
    { label: t('links.profile'), href: "/client/profile", icon: "👤" },
  ];

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
                  {t('eyebrow')}
                </p>
                <h2 className="text-lg font-semibold text-[#333333]">
                  {t('title')}
                </h2>
              </div>
              <ClientUserButton />
            </div>

            <SidebarNav links={NAV_LINKS} />

            <p className="mt-8 text-xs text-[#7C7373]">
              {t('description')}
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

