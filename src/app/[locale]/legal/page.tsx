import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function LegalPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 py-12 md:py-20 bg-[#FAFAFA]">
                <Container>
                    <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-[#E5E7EB] shadow-sm">
                        <h1 className="text-3xl font-bold text-[#333333] mb-8 pb-4 border-b border-[#E5E7EB]">
                            LEGAL NOTICE / DISCLAIMER
                        </h1>

                        <div className="space-y-10">
                            {/* Role of the Platform */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-[#3B4D9D]">Role of the Platform</h2>
                                <div className="space-y-3 text-[#7C7373] leading-relaxed">
                                    <p>
                                        SkillFind.pro is an online information platform that facilitates contact between users (“Clients”) and independent service providers (“Providers”).
                                    </p>
                                    <p>
                                        The sole function of SkillFind.pro is to display publicly available profile information and contact details (including telephone numbers) of Providers, enabling Clients to contact Providers directly.
                                    </p>
                                    <p className="font-medium text-[#333333]">
                                        SkillFind.pro does not provide any services itself, does not act as an employer, agent, broker, or representative of any Provider, and does not enter into service contracts on behalf of either party.
                                    </p>
                                </div>
                            </section>

                            {/* No Payments */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-[#3B4D9D]">No Payments – No Service Provision</h2>
                                <p className="text-[#7C7373] mb-2">SkillFind.pro:</p>
                                <ul className="list-disc pl-5 space-y-2 text-[#7C7373]">
                                    <li>does not process, collect, or manage payments of any kind;</li>
                                    <li>does not participate in price negotiations;</li>
                                    <li>does not supervise, control, or guarantee the performance, quality, legality, safety, or outcome of services provided by Providers.</li>
                                </ul>
                                <p className="text-[#7C7373] mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                                    Any agreement, transaction, or service engagement takes place exclusively and directly between the Client and the Provider, outside of the SkillFind.pro platform.
                                </p>
                            </section>

                            {/* No Liability */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-[#3B4D9D]">No Liability for Services Provided</h2>
                                <p className="text-[#7C7373] mb-2">SkillFind.pro bears no responsibility or liability for:</p>
                                <ul className="list-disc pl-5 space-y-2 text-[#7C7373]">
                                    <li>the manner in which a service is performed;</li>
                                    <li>delays, defects, damages, losses, or disputes arising from services;</li>
                                    <li>acts, omissions, or misconduct of Providers or Clients;</li>
                                    <li>non-performance or poor performance of any service.</li>
                                </ul>
                                <p className="text-[#333333] font-medium mt-2">
                                    Clients acknowledge that they engage Providers at their own risk and discretion.
                                </p>
                            </section>

                            {/* Ratings & Reviews */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-[#3B4D9D]">Ratings, Reviews, and Access Restrictions</h2>
                                <div className="space-y-3 text-[#7C7373] leading-relaxed">
                                    <p>
                                        SkillFind.pro may display ratings, reviews, or feedback submitted by users. While reasonable measures may be taken to limit access to the platform for Providers with consistently poor ratings, SkillFind.pro:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>does not guarantee the accuracy, completeness, or reliability of reviews or ratings;</li>
                                        <li>does not verify every review or recommendation;</li>
                                        <li>does not certify, license, or endorse any Provider.</li>
                                    </ul>
                                    <div className="mt-4">
                                        <p className="font-semibold text-[#333333] mb-2">It is the Client’s sole responsibility to:</p>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li>assess the suitability, qualifications, and reliability of a Provider;</li>
                                            <li>verify reviews, references, licenses, insurance, and credentials where relevant;</li>
                                            <li>ensure that the Provider meets their expectations and legal requirements.</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* No Guarantees */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-[#3B4D9D]">No Guarantees</h2>
                                <p className="text-[#7C7373] leading-relaxed">
                                    SkillFind.pro provides the platform and its content “as is” and “as available”, without any express or implied warranties, including but not limited to warranties of fitness for a particular purpose, reliability, or availability.
                                </p>
                                <p className="text-[#7C7373] mb-2">SkillFind.pro does not guarantee:</p>
                                <ul className="list-disc pl-5 space-y-2 text-[#7C7373]">
                                    <li>that Providers will respond;</li>
                                    <li>that services will be completed;</li>
                                    <li>that outcomes will meet Client expectations.</li>
                                </ul>
                            </section>

                            {/* Jurisdiction */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-[#3B4D9D]">Jurisdiction and Applicable Law</h2>
                                <p className="text-[#7C7373] leading-relaxed">
                                    This website operates as an international digital platform. Users are responsible for ensuring compliance with local laws, regulations, and professional requirements applicable in their jurisdiction.
                                </p>
                                <p className="text-[#7C7373]">
                                    Nothing on SkillFind.pro shall be construed as creating a legal obligation, agency, partnership, or joint venture between SkillFind.pro and any Provider or Client.
                                </p>
                            </section>

                            {/* Acceptance */}
                            <section className="p-6 bg-[#3B4D9D]/5 rounded-2xl border border-[#3B4D9D]/10 text-center space-y-2">
                                <h3 className="text-lg font-bold text-[#3B4D9D]">Acceptance</h3>
                                <p className="text-[#7C7373]">
                                    By using SkillFind.pro, you acknowledge that you have read, understood, and accepted this disclaimer and agree that SkillFind.pro’s role is strictly limited to facilitating contact information between independent parties.
                                </p>
                            </section>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </div>
    );
}
