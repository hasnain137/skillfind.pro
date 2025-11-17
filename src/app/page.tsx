import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PopularCategories } from "@/components/landing/PopularCategories";
import { FeaturedProfessionals } from "@/components/landing/FeaturedProfessionals";
import { SuggestedSkills } from "@/components/landing/SuggestedSkills";
import { TrustSection } from "@/components/landing/TrustSection";
import { DualCTA } from "@/components/landing/DualCTA";
import { CategoryDirectory } from "@/components/landing/CategoryDirectory";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <PopularCategories />
        <FeaturedProfessionals />
        <SuggestedSkills />
        <TrustSection />
        <DualCTA />
        <CategoryDirectory />
      </main>
      <Footer />
    </div>
  );
}
