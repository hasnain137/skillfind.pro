import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <Container className="py-8">
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}
