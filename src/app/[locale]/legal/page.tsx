import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useTranslations } from 'next-intl';

export default function LegalPage() {
    const t = useTranslations('Common'); // Fallback or proper namespace if available

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 py-12">
                <Container>
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h1 className="text-3xl font-bold text-[#333333]">Legal Disclaimer</h1>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-[#333333]">1. Information Only</h2>
                            <p className="text-[#7C7373] leading-relaxed">
                                The information provided on SkillFind is for general informational purposes only.
                                All information on the site is provided in good faith, however we make no representation or warranty of any kind,
                                express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-[#333333]">2. Professional Services</h2>
                            <p className="text-[#7C7373] leading-relaxed">
                                SkillFind acts as a connector between clients and professionals. We do not directly provide the services listed by professionals.
                                While we vet professionals to the best of our ability, we cannot guarantee the quality or outcome of their work.
                                Users engage professionals at their own risk.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-[#333333]">3. Liability</h2>
                            <p className="text-[#7C7373] leading-relaxed">
                                Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site.
                                Your use of the site and your reliance on any information on the site is solely at your own risk.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-[#E5E7EB]">
                            <p className="text-sm text-[#7C7373]">Last updated: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </div>
    );
}
