import 'server-only';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Optimized connection pool for Vercel serverless
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1, // Use single connection per serverless function
  idleTimeoutMillis: 0, // Don't close connections
  connectionTimeoutMillis: 30000, // Increase timeout to 30s
  allowExitOnIdle: true, // Allow process to exit when idle
});

// Log connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle Prisma client', err);
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;