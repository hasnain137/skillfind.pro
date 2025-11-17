// src/components/layout/Navbar.tsx
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Left: Logo + language */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white">
              SF
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Skill<span className="text-[#2563EB]">Find</span>
            </span>
          </div>

          {/* Language/region dropdown */}
          <select
            className="hidden rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#7C7373] shadow-sm hover:border-[#D1D5DB] md:block"
            defaultValue="en"
          >
            <option value="en">EN</option>
            <option value="de">DE</option>
            <option value="fr">FR</option>
          </select>
        </div>

        {/* Middle: navigation (desktop only) */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#7C7373] md:flex">
          <a href="#how-it-works" className="hover:text-[#333333]">
            How it works
          </a>
          <a href="#categories" className="hover:text-[#333333]">
            Categories
          </a>
          <a href="#top-professionals" className="hover:text-[#333333]">
            Top professionals
          </a>
          <a href="#for-professionals" className="hover:text-[#333333]">
            For professionals
          </a>
        </nav>

        {/* Right: auth buttons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden md:inline-flex">
            Log in
          </Button>
          <Button>Sign up</Button>
        </div>
      </Container>
    </header>
  );
}
