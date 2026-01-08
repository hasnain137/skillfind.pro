// src/app/api/client/profile/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { z } from 'zod';

// Validation schema for client profile updates
const updateClientProfileSchema = z.object({
  city: z.string().min(2).max(100).optional(),
  region: z.string().min(2).max(100).optional(),
  country: z.string().length(2).optional(),
  preferredLanguage: z.string().min(2).max(5).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    // Find client by user ID
    const client = await prisma.client.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!client) {
      return Response.json(
        { success: false, error: 'Client profile not found' },
        { status: 404 }
      );
    }

    return successResponse({ client }, 'Client profile retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    // Parse request body
    const body = await request.json();
    
    // Build update data object only with provided fields
    const updateData: any = {};
    
    if (body.city !== undefined) {
      updateData.city = body.city || null;
    }
    
    if (body.region !== undefined) {
      updateData.region = body.region || null;
    }
    
    if (body.country !== undefined) {
      updateData.country = body.country;
    }
    
    if (body.preferredLanguage !== undefined) {
      updateData.preferredLanguage = body.preferredLanguage;
    }

    // Update client with only the provided fields
    const client = await prisma.client.update({
      where: { userId },
      data: updateData,
    });

    return successResponse(
      { client },
      'Client profile updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
