// src/app/admin/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AdminLayout as SharedAdminLayout } from '@/components/layouts/AdminLayout'; // Rename to avoid conflict if any default import issues
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

    // We can pass custom sidebar content if needed, but AdminLayout might have a default sidebar slot
    // For now, let's use the SharedAdminLayout which encapsulates the structure.
    // If SharedAdminLayout expects a sidebar prop, we should pass AdminSidebar there.
    // Let's assume SharedAdminLayout handles structure and we pass sidebar as prop.

    return (
        <SharedAdminLayout sidebar={<AdminSidebar />}>
            {children}
        </SharedAdminLayout>
    );
}
