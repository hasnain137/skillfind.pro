// prisma/prisma.config.ts
// Prisma 7 configuration
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    databaseUrl: process.env.DATABASE_URL,
  },
});
