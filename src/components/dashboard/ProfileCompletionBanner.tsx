'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface ProfileCompletionBannerProps {
  profileCompletion: number;
  userRole: 'CLIENT' | 'PROFESSIONAL';
  missingFields?: {
    dateOfBirth?: boolean;
    phoneNumber?: boolean;
    city?: boolean;
    country?: boolean;
  };
}

export function ProfileCompletionBanner({ 
  profileCompletion, 
  userRole,
  missingFields = {}
}: ProfileCompletionBannerProps) {
  const router = useRouter();

  // Don't show banner if profile is complete enough (>80%)
  if (profileCompletion > 80) return null;

  const missingFieldsList = Object.entries(missingFields)
    .filter(([_, missing]) => missing)
    .map(([field]) => field.replace(/([A-Z])/g, ' $1').toLowerCase());

  const profileUrl = userRole === 'PROFESSIONAL' ? '/pro/profile' : '/client/profile';

  return (
    <div className="rounded-2xl border border-[#FFA500] bg-gradient-to-br from-[#FFF4E6] to-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-semibold text-[#333333]">
              Complete Your Profile
            </h3>
          </div>
          <p className="text-sm text-[#7C7373] mb-3">
            Your profile is <strong>{profileCompletion}% complete</strong>. 
            {missingFieldsList.length > 0 && (
              <> Add {missingFieldsList.join(', ')} to improve your experience.</>
            )}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#FFA500] h-full transition-all duration-500 ease-out"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
        
        <Button
          onClick={() => router.push(profileUrl)}
          className="whitespace-nowrap"
        >
          Complete Profile
        </Button>
      </div>
    </div>
  );
}
