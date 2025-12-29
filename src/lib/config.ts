
import { prisma } from '@/lib/prisma';

/**
 * Retrieves a configuration value by key.
 * Priority: Database (SystemSetting) > Environment Variable (process.env)
 */
export async function getConfig(key: string): Promise<string | undefined> {
    try {
        // 1. Check Database
        const setting = await prisma.systemSetting.findUnique({
            where: { key },
        });

        if (setting && setting.value) {
            return setting.value;
        }

        // 2. Fallback to Environment
        return process.env[key];
    } catch (error) {
        console.warn(`[Config] Failed to fetch setting '${key}' from DB, falling back to ENV.`, error);
        return process.env[key];
    }
}
