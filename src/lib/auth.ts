// Authentication utilities for API routes
import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { User, UserRole } from '@prisma/client';

export interface AuthContext {
  userId: string;
  clerkId: string;
  role: UserRole;
  user: User;
}

/**
 * Get authenticated user context for API routes
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<AuthContext> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error('UNAUTHORIZED');
  }

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  if (user.isBanned) {
    throw new Error('BANNED');
  }

  return {
    userId: user.id,
    clerkId: user.clerkId,
    role: user.role,
    user,
  };
}

/**
 * Require specific role(s) for API route access
 * @throws Error if user doesn't have required role
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[]
): Promise<AuthContext> {
  const authContext = await requireAuth();

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(authContext.role)) {
    throw new Error('FORBIDDEN');
  }

  return authContext;
}

/**
 * Require CLIENT role
 */
export async function requireClient(): Promise<AuthContext> {
  return requireRole('CLIENT');
}

/**
 * Require PROFESSIONAL role
 */
export async function requireProfessional(): Promise<AuthContext> {
  return requireRole('PROFESSIONAL');
}

/**
 * Require ADMIN role
 */
export async function requireAdmin(): Promise<AuthContext> {
  return requireRole('ADMIN');
}

/**
 * Get optional auth context (returns null if not authenticated)
 */
export async function getOptionalAuth(): Promise<AuthContext | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}

/**
 * Check if user has completed profile setup
 */
export async function requireProfileComplete(authContext: AuthContext): Promise<void> {
  const user = authContext.user;

  // Check basic verification
  if (!user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  if (!user.phoneVerified) {
    throw new Error('PHONE_NOT_VERIFIED');
  }

  // Additional checks for professionals
  if (user.role === 'PROFESSIONAL') {
    const professional = await prisma.professional.findUnique({
      where: { userId: user.id },
    });

    if (!professional) {
      throw new Error('PROFESSIONAL_PROFILE_NOT_FOUND');
    }

    // Check if profile is complete enough
    if (professional.status === 'INCOMPLETE') {
      throw new Error('PROFESSIONAL_PROFILE_INCOMPLETE');
    }
  }
}

/**
 * Check if user is 18+ years old
 */
export function requireAge18Plus(dateOfBirth: Date): void {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    // Birthday hasn't occurred this year yet
    if (age - 1 < 18) {
      throw new Error('AGE_REQUIREMENT_NOT_MET');
    }
  } else {
    if (age < 18) {
      throw new Error('AGE_REQUIREMENT_NOT_MET');
    }
  }
}
