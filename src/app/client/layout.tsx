import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Client Dashboard | SkillFind",
  description: "Manage your service requests and professionals in one place.",
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/client" },
  { label: "My requests", href: "/client/requests" },
  { label: "Create request", href: "/client/requests/new" },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3F4F6] py-10">
      <Container className="flex flex-col gap-6 lg:flex-row">
        <aside className="rounded-2xl border border-[#DDE7FF] bg-gradient-to-b from-white via-[#F7FAFF] to-[#EEF2FF] p-5 shadow-sm lg:w-64">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C7373]">
              Client area
            </p>
            <h2 className="text-lg font-semibold text-[#333333]">
              Plan your projects
            </h2>
          </div>

          <nav className="mt-6 flex flex-col gap-2 text-sm font-semibold text-[#7C7373]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2 text-left hover:bg-[#F3F4F6] hover:text-[#333333]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="mt-8 text-xs text-[#7C7373]">
            Post new service needs, review offers from verified professionals,
            and keep every conversation in one place.
          </p>
        </aside>

        <div className="flex-1">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
