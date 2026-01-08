'use client';

import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function CategoriesLoading() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Navbar placeholder */}
            <div className="h-16 border-b border-gray-200 bg-white" />

            <main className="flex-1 bg-[#FAFAFA] py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header skeleton */}
                    <div className="mb-8 text-center">
                        <Skeleton className="h-9 w-64 mx-auto mb-2" />
                        <Skeleton className="h-4 w-96 mx-auto" />
                    </div>

                    {/* Categories grid skeleton */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Card key={i} padding="lg">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-32 mb-2" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                                    <div className="flex gap-1.5">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
