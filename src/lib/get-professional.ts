// Helper to get professional or client from Clerk userId
import { prisma } from './prisma';

// ============================================
// PROFESSIONAL HELPERS
// ============================================

export async function getProfessionalByClerkId(clerkUserId: string) {
  // First find the user by Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (!user) {
    return null;
  }

  // Then find the professional by database user ID
  const professional = await prisma.professional.findUnique({
    where: { userId: user.id },
  });

  return professional;
}

export async function getProfessionalWithRelations(clerkUserId: string, include?: any) {
  // First find the user by Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (!user) {
    return null;
  }

  // Then find the professional with relations
  const professional = await prisma.professional.findUnique({
    where: { userId: user.id },
    include: include,
  });

  return professional;
}

// ============================================
// CLIENT HELPERS
// ============================================

export async function getClientByClerkId(clerkUserId: string) {
  // First find the user by Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (!user) {
    return null;
  }

  // Then find the client by database user ID
  const client = await prisma.client.findUnique({
    where: { userId: user.id },
  });

  return client;
}

export async function getClientWithRelations(clerkUserId: string, include?: any) {
  // First find the user by Clerk ID
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (!user) {
    return null;
  }

  // Then find the client with relations
  const client = await prisma.client.findUnique({
    where: { userId: user.id },
    include: include,
  });

  return client;
}
