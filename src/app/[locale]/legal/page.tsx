import { Container } from "@/components/ui/Container";

export default function LegalPage() {
    return (
        <main className="min-h-screen bg-white py-12 md:py-20">
            <Container>
                <div className="mx-auto max-w-4xl">
                    <h1 className="mb-10 text-3xl font-bold text-[#333333] md:text-4xl">
                        LEGAL NOTICE / DISCLAIMER
                    </h1>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-[#333333]">Role of the Platform</h2>
                        <div className="space-y-4 text-[#555555]">
                            <p>
                                SkillFind.pro is an online information platform that facilitates contact between users (“Clients”) and independent service providers (“Providers”).
                            </p>
                            <p>
                                The sole function of SkillFind.pro is to display publicly available profile information and contact details (including telephone numbers) of Providers, enabling Clients to contact Providers directly.
                            </p>
                            <p>
                                SkillFind.pro does not provide any services itself, does not act as an employer, agent, broker, or representative of any Provider, and does not enter into service contracts on behalf of either party.
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-[#333333]">No Payments – No Service Provision</h2>
                        <p className="mb-4 text-[#555555]">SkillFind.pro:</p>
                        <ul className="list-disc space-y-2 pl-5 text-[#555555]">
                            <li>does not process, collect, or manage payments of any kind;</li>
                            <li>does not participate in price negotiations;</li>
                            <li>does not supervise, control, or guarantee the performance, quality, legality, safety, or outcome of services provided by Providers.</li>
                        </ul>
                        <p className="mt-4 text-[#555555]">
                            Any agreement, transaction, or service engagement takes place exclusively and directly between the Client and the Provider, outside of the SkillFind.pro platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-[#333333]">No Liability for Services Provided</h2>
                        <p className="mb-4 text-[#555555]">SkillFind.pro bears no responsibility or liability for:</p>
                        <ul className="list-disc space-y-2 pl-5 text-[#555555]">
                            <li>the manner in which a service is performed;</li>
                            <li>delays, defects, damages, losses, or disputes arising from services;</li>
                            <li>acts, omissions, or misconduct of Providers or Clients;</li>
                            <li>non-performance or poor performance of any service.</li>
                        </ul>
                        <p className="mt-4 text-[#555555]">
                            Clients acknowledge that they engage Providers at their own risk and discretion.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-[#333333]">Ratings, Reviews, and Access Restrictions</h2>
                        <p className="mb-4 text-[#555555]">
                            SkillFind.pro may display ratings, reviews, or feedback submitted by users. While reasonable measures may be taken to limit access to the platform for Providers with consistently poor ratings, SkillFind.pro:
                        </p>
                        <ul className="list-disc space-y-2 pl-5 text-[#555555]">
                            <li>does not guarantee the accuracy, completeness, or reliability of reviews or ratings;</li>
                            <li>does not verify every review or recommendation;</li>
                            <li>does not certify, license, or endorse any Provider.</li>
                        </ul>
                        <p className="mt-4 mb-2 text-[#555555]">It is the Client’s sole responsibility to:</p>
                        <ul className="list-disc space-y-2 pl-5 text-[#555555]">
                            <li>assess the suitability, qualifications, and reliability of a Provider;</li>
                            <li>verify reviews, references, licenses, insurance, and credentials where relevant;</li>
                            <li>ensure that the Provider meets their expectations and legal requirements.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-[#333333]">No Guarantees</h2>
                        <p className="mb-4 text-[#555555]">
                            SkillFind.pro provides the platform and its content “as is” and “as available”, without any express or implied warranties, including but not limited to warranties of fitness for a particular purpose, reliability, or availability.
                        </p>
                        <p className="mb-2 text-[#555555]">SkillFind.pro does not guarantee:</p>
                        <ul className="list-disc space-y-2 pl-5 text-[#555555]">
                            <li>that Providers will respond;</li>
                            <li>that services will be completed;</li>
                            <li>that outcomes will meet Client expectations.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-bold text-[#333333]">Jurisdiction and Applicable Law</h2>
                        <div className="space-y-4 text-[#555555]">
                            <p>
                                This website operates as an international digital platform. Users are responsible for ensuring compliance with local laws, regulations, and professional requirements applicable in their jurisdiction.
                            </p>
                            <p>
                                Nothing on SkillFind.pro shall be construed as creating a legal obligation, agency, partnership, or joint venture between SkillFind.pro and any Provider or Client.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-bold text-[#333333]">Acceptance</h2>
                        <p className="text-[#555555]">
                            By using SkillFind.pro, you acknowledge that you have read, understood, and accepted this disclaimer and agree that SkillFind.pro’s role is strictly limited to facilitating contact information between independent parties.
                        </p>
                    </section>
                </div>
            </Container>
        </main>
    );
}
