import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        // Use DATABASE_URL without pgbouncer=true for migrations/push
        url: env('DATABASE_URL')?.replace('?pgbouncer=true', '') || env('DATABASE_URL'),
    },
});
