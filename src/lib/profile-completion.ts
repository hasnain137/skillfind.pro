import { User, Professional, Client } from '@prisma/client';

interface ProfileCompletionResult {
  completion: number;
  missingFields: {
    dateOfBirth: boolean;
    phoneNumber: boolean;
    city: boolean;
    country: boolean;
  };
}

export function calculateProfileCompletion(
  user: User,
  profile: (Professional | Client) | null
): ProfileCompletionResult {
  const missingFields = {
    dateOfBirth: !user.dateOfBirth,
    phoneNumber: !user.phoneNumber,
    city: !profile?.city,
    country: !profile?.country || profile.country === 'FR', // Default FR means not filled
  };

  // Base completion from user fields
  let completion = 0;
  
  // Basic user fields (40% total)
  if (user.dateOfBirth) completion += 10;
  if (user.phoneNumber) completion += 10;
  if (user.emailVerified) completion += 10;
  if (user.phoneVerified) completion += 10;

  // Location fields (20% total)
  if (profile?.city) completion += 10;
  if (profile?.country && profile.country !== 'FR') completion += 10;

  // Role-specific completion (40% total)
  if (profile && 'profileCompletion' in profile) {
    // Professional - use their calculated profileCompletion
    const professionalProfile = profile as Professional;
    completion += Math.floor((professionalProfile.profileCompletion / 100) * 40);
  } else {
    // Client - simpler completion (just having the profile adds 40%)
    if (profile) completion += 40;
  }

  return {
    completion: Math.min(completion, 100),
    missingFields,
  };
}
