import { Container } from "@/components/ui/Container";
import { SkeletonProfessionalCard } from "@/components/ui/Skeleton";

export default function SearchLoading() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="h-16 border-b border-gray-200 bg-white" /> {/* Navbar placeholder */}
            <main className="flex-1 bg-[#FAFAFA] py-8">
                <Container>
                    <div className="mb-6">
                        <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
                        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-4">
                        {/* Filters skeleton */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                                <div className="h-6 w-20 bg-gray-200 rounded mb-4 animate-pulse" />
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="mb-4">
                                        <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
                                        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Results skeleton */}
                        <div className="lg:col-span-3">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <SkeletonProfessionalCard key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    );
}
