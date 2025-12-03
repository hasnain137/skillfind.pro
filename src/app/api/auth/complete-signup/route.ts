// POST /api/auth/complete-signup
// Complete user registration after Clerk signup
import { NextRequest } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError, createdResponse } from '@/lib/api-response';
import { completeSignupSchema } from '@/lib/validations/user';
import { requireAge18Plus } from '@/lib/auth';
import { ConflictError, UnauthorizedError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // Get Clerk auth first
    const { userId } = await auth();

    if (!userId) {
      console.log('❌ No userId from auth() - user not signed in');
      throw new UnauthorizedError('You must be signed in to complete signup');
    }

    console.log('✅ User authenticated via Clerk:', userId);

    // Get full Clerk user data
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      throw new UnauthorizedError('User not found in Clerk');
    }

    console.log(`📝 Processing complete-signup for Clerk user: ${clerkUser.id}`);

    // Parse and validate request body ONCE at the beginning
    const body = await request.json();
    const data = completeSignupSchema.parse(body);

    console.log(`📋 Request data - Role: ${data.role}, City: ${data.city || 'N/A'}, Country: ${data.country || 'N/A'}`);

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: {
        professionalProfile: true,
        clientProfile: true,
      },
    });

    if (existingUser) {
      console.log(`✅ User exists in database: ${existingUser.id}, Role: ${existingUser.role}`);

      // Update user table with DOB and phone if provided
      if (data.dateOfBirth || data.phoneNumber) {
        console.log('📝 Updating user personal information...');
        
        const updateData: any = {};
        
        if (data.dateOfBirth) {
          try {
            requireAge18Plus(data.dateOfBirth);
            updateData.dateOfBirth = data.dateOfBirth;
            updateData.isOver18 = true;
            console.log('✅ Age validation passed');
          } catch (ageError) {
            console.error('❌ Age validation failed:', ageError);
            throw ageError;
          }
        }
        
        if (data.phoneNumber) {
          updateData.phoneNumber = data.phoneNumber;
        }
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: updateData,
        });
        
        console.log('✅ User personal information updated');
      }

      // User already exists - check if they have the required profile
      const isProfessional = existingUser.role === 'PROFESSIONAL';
      const isClient = existingUser.role === 'CLIENT';

      // If professional but no professional profile, create it
      if (isProfessional && !existingUser.professionalProfile) {
        console.log('🔨 Creating missing professional profile...');

        const professional = await prisma.professional.create({
          data: {
            userId: existingUser.id,
            city: data.city || '',
            country: data.country || 'FR',
            profileCompletion: data.city && data.country ? 20 : 10,
          },
        });

        // Initialize wallet
        await prisma.wallet.create({
          data: {
            professionalId: professional.id,
            balance: 0,
          },
        });

        console.log('✅ Professional profile and wallet created');
      } else if (isProfessional && existingUser.professionalProfile && data.city) {
        // Update existing professional profile with city/country if provided
        console.log('📝 Updating existing professional profile location...');
        await prisma.professional.update({
          where: { id: existingUser.professionalProfile.id },
          data: {
            city: data.city,
            country: data.country || 'FR',
          },
        });
        console.log('✅ Professional profile location updated');
      }

      // If client but no client profile, create it
      if (isClient && !existingUser.clientProfile) {
        console.log('🔨 Creating missing client profile...');

        await prisma.client.create({
          data: {
            userId: existingUser.id,
            city: data.city || '',
            country: data.country || 'FR',
          },
        });

        console.log('✅ Client profile created');
      } else if (isClient && existingUser.clientProfile && data.city) {
        // Update existing client profile with city/country if provided
        console.log('📝 Updating existing client profile location...');
        await prisma.client.update({
          where: { id: existingUser.clientProfile.id },
          data: {
            city: data.city,
            country: data.country || 'FR',
          },
        });
        console.log('✅ Client profile location updated');
      }

      // Ensure Clerk metadata is in sync
      try {
        await client.users.updateUserMetadata(clerkUser.id, {
          publicMetadata: {
            role: existingUser.role,
          },
        });
        console.log('✅ Clerk metadata synced');
      } catch (metadataError) {
        console.error('⚠️ Warning: Could not sync Clerk metadata:', metadataError);
        // Don't fail the request if metadata sync fails
      }

      // Return success
      return successResponse(
        {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            role: existingUser.role,
          },
        },
        'User profile complete'
      );
    }

    console.log('🆕 Creating new user in database...');

    // Validate age requirement (18+) only if dateOfBirth is provided
    if (data.dateOfBirth) {
      try {
        requireAge18Plus(data.dateOfBirth);
        console.log('✅ Age validation passed');
      } catch (ageError) {
        console.error('❌ Age validation failed:', ageError);
        throw ageError;
      }
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        role: data.role,
        dateOfBirth: data.dateOfBirth || null,
        phoneNumber: data.phoneNumber || null,
        emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        avatar: clerkUser.imageUrl,
        isOver18: data.dateOfBirth ? true : false, // Only mark true if DOB provided and validated
      },
    });

    console.log(`✅ User created in database: ${user.id}`);

    // If professional, create professional profile
    if (data.role === 'PROFESSIONAL') {
      console.log('🔨 Creating professional profile...');

      const professional = await prisma.professional.create({
        data: {
          userId: user.id,
          city: data.city || '',
          country: data.country || 'FR',
          profileCompletion: data.city && data.country ? 20 : 10,
        },
      });

      // Initialize wallet
      await prisma.wallet.create({
        data: {
          professionalId: professional.id,
          balance: 0,
        },
      });

      console.log('✅ Professional profile and wallet created');
    }

    // If client, create client profile
    if (data.role === 'CLIENT') {
      console.log('🔨 Creating client profile...');

      await prisma.client.create({
        data: {
          userId: user.id,
          city: data.city || '',
          country: data.country || 'FR',
        },
      });

      console.log('✅ Client profile created');
    }

    // Update Clerk user metadata with role
    try {
      await client.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: {
          role: data.role,
        },
      });
      console.log('✅ Clerk metadata updated with role');
    } catch (metadataError) {
      console.error('⚠️ Warning: Could not update Clerk metadata:', metadataError);
      // Don't fail the request if metadata update fails - user is already in DB
    }

    console.log('🎉 Account creation complete!');

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
    console.error('❌ Error in complete-signup:', error);
    return handleApiError(error);
  }
}
