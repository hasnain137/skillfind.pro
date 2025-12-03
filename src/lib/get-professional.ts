// Helper to get professional from Clerk userId
import { prisma } from './prisma';

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
