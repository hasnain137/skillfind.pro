import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function ProfessionalProfileLoading() {
    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Hero Section Skeleton */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Skeleton className="h-32 w-32 rounded-full border-4 border-white/20 bg-white/20" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-10 w-64 bg-white/20" />
                            <Skeleton className="h-6 w-48 bg-white/20" />
                            <div className="flex gap-4">
                                <Skeleton className="h-8 w-24 rounded-full bg-white/20" />
                                <Skeleton className="h-8 w-32 rounded-full bg-white/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card padding="lg">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </Card>
                        <Card padding="lg">
                            <Skeleton className="h-6 w-40 mb-4" />
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                                ))}
                            </div>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card padding="lg">
                            <Skeleton className="h-6 w-24 mb-4" />
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
