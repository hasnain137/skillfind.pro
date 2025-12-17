// src/app/admin/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/prisma';
import { AdminLayout as SharedAdminLayout } from '@/components/layouts/AdminLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function AdminLayout({
    children,
    params,
}: AdminLayoutProps) {
    const { locale } = await params;
    const { userId } = await auth();

    if (!userId) {
        redirect({ href: '/login', locale });
    }

    // Double-check admin role in database
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user || user.role !== 'ADMIN') {
        redirect({ href: '/', locale });
    }

    return (
        <SharedAdminLayout sidebar={<AdminSidebar />}>
            {children}
        </SharedAdminLayout>
    );
}
