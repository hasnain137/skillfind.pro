// src/components/layout/Footer.tsx
import { Container } from "@/components/ui/Container";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#FAFAFA] py-12 md:py-16">
      <Container>
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Brand + short text */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white shadow-sm">
                SF
              </div>
              <span className="text-base font-bold text-[#333333]">
                Skill<span className="text-[#2563EB]">Find</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-[#7C7373] leading-relaxed">
              A trusted marketplace connecting clients with verified professionals
              for tutoring, tech, home services, and more.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 text-sm text-[#7C7373] md:grid-cols-3">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">
                For clients
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/search" className="hover:text-[#2563EB] transition-colors">
                    Browse categories
                  </Link>
                </li>
                <li>
                  <Link href="#top-professionals" className="hover:text-[#2563EB] transition-colors">
                    Featured professionals
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-[#2563EB] transition-colors">
                    How it works
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">
                For professionals
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/signup" className="hover:text-[#2563EB] transition-colors">
                    Become a professional
                  </Link>
                </li>
                <li>
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    Pricing & visibility
                  </button>
                </li>
                <li>
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    Help & support
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    Terms
                  </button>
                </li>
                <li>
                  <button type="button" className="hover:text-[#2563EB] transition-colors">
                    Privacy
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E5E7EB] pt-8 text-xs text-[#7C7373] md:flex-row">
          <p>© {new Date().getFullYear()} SkillFind. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <select
              className="rounded-lg border border-[#E5E7EB] bg-white py-1.5 pl-3 pr-8 text-xs text-[#7C7373] shadow-sm focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              defaultValue="en"
            >
              <option value="en">English</option>
            </select>
            <span>Made with ❤️ for the community.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
