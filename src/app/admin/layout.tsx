import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/login');
    }

    // Double-check admin role in database
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user || user.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="flex h-screen bg-[#F3F4F6]">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
