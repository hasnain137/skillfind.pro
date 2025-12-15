import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await requireAdmin();

        const settings = await prisma.systemSetting.findMany();

        // Convert to key-value map
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return successResponse(settingsMap);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAdmin();

        const body = await req.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            throw new Error('Key and Value are required');
        }

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
        });

        return successResponse(setting);
    } catch (error) {
        return handleApiError(error);
    }
}
