import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Link } from '@/i18n/routing';
import { Shield, Users, Zap, Search, MessageSquare, CheckCircle, CreditCard, Lock } from 'lucide-react';

export default function LearnMorePage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">

                {/* Hero Section */}
                <section className="relative overflow-hidden bg-[#3B4D9D] py-20 sm:py-32">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                    <Container className="relative">
                        <div className="mx-auto max-w-3xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                                Connecting Talent with <span className="text-blue-200">Opportunity</span>
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-blue-100 max-w-2xl mx-auto">
                                SkillFind is a community-driven marketplace dedicated to empowering professionals and helping clients achieve their goals through trusted, direct connections.
                            </p>
                        </div>
                    </Container>
                </section>

                {/* Marketplace Features Grid */}
                <section className="py-24 bg-white">
                    <Container>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-[#333333] mb-4">
                                How SkillFind Works
                            </h2>
                            <p className="text-[#7C7373] text-lg max-w-2xl mx-auto">
                                We've built a platform that removes the friction from hiring and freelancing. Here's what makes us different.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: Search,
                                    title: "Smart Matching",
                                    desc: "Our advanced search filters help you find the exact expertise you need, from local tutors to remote developers."
                                },
                                {
                                    icon: CheckCircle,
                                    title: "Verified Professionals",
                                    desc: "We verify identities and credentials so you can hire with confidence. Look for the blue checkmark."
                                },
                                {
                                    icon: MessageSquare,
                                    title: "Direct Communication",
                                    desc: "Chat directly with professionals to discuss project details, negotiate rates, and set expectations before hiring."
                                },
                                {
                                    icon: CreditCard,
                                    title: "Fair Pricing",
                                    desc: "Professionals set their own rates. Clients compare multiple offers. No hidden platform markup fees."
                                },
                                {
                                    icon: Zap,
                                    title: "Fast & Efficient",
                                    desc: "Post a request and get offers in minutes. Most clients find their perfect match within 24 hours."
                                },
                                {
                                    icon: Users,
                                    title: "Community Reviews",
                                    desc: "Read genuine feedback from other clients. Our review system ensures transparency and accountability."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="flex flex-col gap-4 p-8 rounded-3xl bg-[#FAFAFA] border border-[#E5E7EB] hover:shadow-lg transition-all duration-300">
                                    <div className="h-14 w-14 rounded-2xl bg-blue-50 text-[#3B4D9D] flex items-center justify-center">
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#333333] mb-3">{feature.title}</h3>
                                        <p className="text-[#7C7373] leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Container>
                </section>

                {/* Trust & Safety Section */}
                <section className="py-24 bg-[#3B4D9D]/5">
                    <Container>
                        <div className="grid gap-16 lg:grid-cols-2 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-[#3B4D9D] font-bold text-sm mb-6">
                                    <Shield className="w-4 h-4" />
                                    Trust & Safety
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-[#333333] mb-6">
                                    Your security is our priority.
                                </h2>
                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 h-10 w-10 text-[#3B4D9D] mt-1">
                                            <Lock className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#333333] mb-2">Data Protection</h3>
                                            <p className="text-[#7C7373] leading-relaxed">
                                                We use industry-standard encryption to protect your personal information and communication data. Your privacy matters.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 h-10 w-10 text-[#3B4D9D] mt-1">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#333333] mb-2">Vetted Quality</h3>
                                            <p className="text-[#7C7373] leading-relaxed">
                                                Every professional undergoes a review process. We monitor platform activity to ensure a high-quality, spam-free environment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Element representing Trust */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-200/50 blur-3xl rounded-full opacity-30"></div>
                                <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-[#E5E7EB]">
                                    <div className="flex items-center gap-4 mb-6 border-b border-[#E5E7EB] pb-6">
                                        <div className="bg-green-50 p-3 rounded-full">
                                            <Shield className="w-8 h-8 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#333333] text-lg">Verified Identity</div>
                                            <div className="text-sm text-[#7C7373]">Account Status: Active</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#7C7373]">Email Verification</span>
                                            <span className="text-green-600 font-bold">✓ Verified</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#7C7373]">Phone Verification</span>
                                            <span className="text-green-600 font-bold">✓ Verified</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#7C7373]">Professional Review</span>
                                            <span className="text-green-600 font-bold">✓ Passed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-white text-center border-t border-[#E5E7EB]">
                    <Container>
                        <h2 className="text-3xl font-bold tracking-tight text-[#333333] sm:text-4xl mb-6">
                            Join the future of work.
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-[#7C7373] mb-10">
                            Whether you're looking to hire or looking to work, SkillFind is the place for you.
                        </p>
                        <Link href="/signup">
                            <Button className="px-10 py-6 h-auto text-lg rounded-xl bg-[#3B4D9D] hover:bg-[#334185] shadow-xl shadow-blue-900/10 transition-all hover:scale-105">
                                Join Our Community
                            </Button>
                        </Link>
                    </Container>
                </section>

            </main>
            <Footer />
        </div>
    );
}
