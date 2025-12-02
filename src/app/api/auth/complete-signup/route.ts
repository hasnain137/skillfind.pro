// POST /api/auth/complete-signup
// Complete user registration after Clerk signup
import { NextRequest } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { completeSignupSchema } from '@/lib/validations/user';
import { requireAge18Plus } from '@/lib/auth';
import { ConflictError, UnauthorizedError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // Get Clerk user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      throw new UnauthorizedError('You must be signed in to complete signup');
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (existingUser) {
      throw new ConflictError('User profile already exists');
    }

    // Parse and validate request body
    const body = await request.json();
    const data = completeSignupSchema.parse(body);

    // Validate age requirement (18+)
    requireAge18Plus(data.dateOfBirth);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        role: data.role,
        dateOfBirth: data.dateOfBirth,
        phoneNumber: data.phoneNumber,
        emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        avatar: clerkUser.imageUrl,
        isOver18: true, // Already validated by requireAge18Plus
      },
    });

    // If professional, create professional profile
    if (data.role === 'PROFESSIONAL') {
      const professional = await prisma.professional.create({
        data: {
          userId: user.id,
          city: data.city,
          country: data.country,
          profileCompletion: 20, // Basic info completed
        },
      });

      // Initialize wallet
      await prisma.wallet.create({
        data: {
          professionalId: professional.id,
          balance: 0,
        },
      });
    }

    // If client, create client profile
    if (data.role === 'CLIENT') {
      await prisma.client.create({
        data: {
          userId: user.id,
          city: data.city,
          country: data.country,
        },
      });
    }

    // Update Clerk user metadata with role
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        role: data.role,
      },
    });

    return createdResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      'Account created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
