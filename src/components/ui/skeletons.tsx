
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card"
import { cn } from "@/lib/cn"

// Basic Skeleton Pulse
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
    />
)

// ============================================
// MIRROR SKELETONS
// Structure matches real components exactly
// ============================================

export function ProfileCardSkeleton() {
    return (
        <Card level={1} className="w-full">
            <CardHeader className="flex flex-row items-center gap-4">
                {/* Avatar Mirror */}
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    {/* Name Mirror */}
                    <Skeleton className="h-4 w-[150px]" />
                    {/* Role Mirror */}
                    <Skeleton className="h-4 w-[100px]" />
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* Description Mirror - 3 lines */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
            <CardFooter>
                {/* Button Mirror */}
                <Skeleton className="h-10 w-24 rounded-full" />
            </CardFooter>
        </Card>
    )
}

export function RequestCardSkeleton() {
    return (
        <Card level={2} className="w-full">
            <CardHeader>
                <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-16" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    )
}

export { Skeleton }
