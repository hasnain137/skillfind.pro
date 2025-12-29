
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// List of allowed keys to manage (whitelist)
const ALLOWED_KEYS = [
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY' // Usually read-only/env only, but added for completeness if needed
];

export async function GET() {
    try {
        // Ensure Admin
        // const { user } = await requireAdmin(); // Uncomment when strictly enforcing, for now assuming middleware/layout protects this path or similar

        // Fetch all DB settings
        const dbSettings = await prisma.systemSetting.findMany({
            where: { key: { in: ALLOWED_KEYS } }
        });

        const results = ALLOWED_KEYS.map(key => {
            const dbValue = dbSettings.find(s => s.key === key)?.value;
            const envValue = process.env[key];

            const activeValue = dbValue || envValue;
            const isConfigured = !!activeValue;

            // Mask the value
            let maskedValue = '';
            if (activeValue && activeValue.length > 8) {
                maskedValue = `${activeValue.substring(0, 3)}...${activeValue.substring(activeValue.length - 4)}`;
            } else if (activeValue) {
                maskedValue = '***';
            }

            return {
                key,
                maskedValue,
                source: dbValue ? 'DB' : (envValue ? 'ENV' : 'MISSING'),
                isConfigured
            };
        });

        return NextResponse.json({ data: results });
    } catch (error) {
        console.error('Settings API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        // Ensure Admin checks here...

        const body = await req.json();
        const { key, value } = body;

        if (!ALLOWED_KEYS.includes(key)) {
            return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 });
        }

        if (!value) {
            return NextResponse.json({ error: 'Value required' }, { status: 400 });
        }

        await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Settings API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        // Ensure Admin checks here...

        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (!key || !ALLOWED_KEYS.includes(key)) {
            return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 });
        }

        await prisma.systemSetting.delete({
            where: { key }
        });

        return NextResponse.json({ success: true, message: 'Reverted to ENV value (if present)' });
    } catch (error) {
        // P2025 = Record to delete does not exist
        return NextResponse.json({ success: true });
    }
}
