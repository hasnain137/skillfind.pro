// src/components/layout/Footer.tsx
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#FAFAFA] py-8 md:py-10">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand + short text */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#2563EB] text-[11px] font-bold text-white">
                SF
              </div>
              <span className="text-sm font-semibold text-[#333333]">
                Skill<span className="text-[#2563EB]">Find</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-[#7C7373] leading-relaxed">
              A marketplace for clients and professionals to connect for
              tutoring, tech help, design, wellness, and everyday services.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-6 text-xs text-[#7C7373] md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#333333]">
                For clients
              </h4>
              <ul className="space-y-1">
                <li>
                  <a href="#categories" className="hover:text-[#2563EB]">
                    Browse categories
                  </a>
                </li>
                <li>
                  <a href="#top-professionals" className="hover:text-[#2563EB]">
                    Featured professionals
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#2563EB]">
                    How it works
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#333333]">
                For professionals
              </h4>
              <ul className="space-y-1">
                <li>
                  <a href="#for-professionals" className="hover:text-[#2563EB]">
                    Become a professional
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    className="hover:text-[#2563EB]"
                  >
                    Pricing & visibility
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="hover:text-[#2563EB]"
                  >
                    Help & support
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#333333]">
                Company
              </h4>
              <ul className="space-y-1">
                <li>
                  <button type="button" className="hover:text-[#2563EB]">
                    About
                  </button>
                </li>
                <li>
                  <button type="button" className="hover:text-[#2563EB]">
                    Terms
                  </button>
                </li>
                <li>
                  <button type="button" className="hover:text-[#2563EB]">
                    Privacy
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4 text-[11px] text-[#7C7373] md:flex-row">
          <p>© {new Date().getFullYear()} SkillFind. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <select
              className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[11px] text-[#7C7373] shadow-sm hover:border-[#D1D5DB]"
              defaultValue="en"
            >
              <option value="en">English</option>
              {/* Add more locales later */}
            </select>
            <span>Made for clients & professionals.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
