import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Professional Area | SkillFind",
  description:
    "Manage your SkillFind professional profile, matching requests, and offers.",
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/pro" },
  { label: "Matching requests", href: "/pro/requests" },
  { label: "My profile", href: "/pro/profile" },
];

export default function ProLayout({
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
              Professional area
            </p>
            <h2 className="text-lg font-semibold text-[#333333]">
              Manage your work
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
            This space is for professionals to discover matching client
            requests, send offers, and manage their ongoing work.
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
