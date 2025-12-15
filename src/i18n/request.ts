
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

// Cache the translations fetching to improve performance
const getDatabaseTranslations = unstable_cache(
    async (locale: string) => {
        try {
            if (!prisma) return {};

            const translations = await prisma.translation.findMany({
                where: { locale },
                select: { key: true, value: true, namespace: true }
            });

            // Transform into nested object structure if needed, or flat map
            // For simplicity, we'll start with flat keys, but ideally we merge them
            // We will simply map key -> value for now

            const dbMessages: Record<string, any> = {};

            for (const t of translations) {
                // Support dots in keys for nesting? e.g. "auth.signin"
                // For now, let's assume flat keys to avoid complex deep merging logic bugs
                // Or actually, let's implement basic deep set
                const parts = t.key.split('.');
                let current = dbMessages;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (i === parts.length - 1) {
                        current[part] = t.value;
                    } else {
                        current[part] = current[part] || {};
                        current = current[part];
                    }
                }
            }

            return dbMessages;
        } catch (error) {
            console.error('Failed to fetch translations from DB:', error);
            return {};
        }
    },
    ['translations-db'],
    { tags: ['translations'], revalidate: 1 } // Revalidate every second to see updates immediately
);

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    // Load default file-based messages
    const fileMessages = (await import(`../../messages/${locale}.json`)).default;

    // Load database overrides
    const dbMessages = await getDatabaseTranslations(locale);

    // Merge: DB overwrites File
    // Use a custom deep merge to ensure we don't wipe out entire namespaces
    const messages = { ...fileMessages };

    function deepMerge(target: any, source: any) {
        if (!source) return target;
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && !Array.isArray(source[key]) && key in target) {
                // optimize: modify target in place or new object?
                // Let's modify valid target key
                target[key] = deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    const mergedMessages = deepMerge(messages, dbMessages);

    return {
        locale,
        messages: mergedMessages
    };
});
