'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface ProfileStep {
  id: string;
  label: string;
  actionUrl?: string;
}

interface ProfileCompletionBannerProps {
  profileCompletion: number;
  userRole: 'CLIENT' | 'PROFESSIONAL';
  missingSteps?: ProfileStep[];
}

export function ProfileCompletionBanner({
  profileCompletion,
  userRole,
  missingSteps = []
}: ProfileCompletionBannerProps) {
  const router = useRouter();

  if (profileCompletion === 100) return null;

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
            {missingSteps.length > 0 && (
              <> Next steps: {missingSteps.slice(0, 3).map(s => s.label).join(', ')}...</>
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
          onClick={() => router.push(missingSteps[0]?.actionUrl || profileUrl)}
          className="whitespace-nowrap"
        >
          {missingSteps.length > 0 ? `Fix: ${missingSteps[0].label}` : 'Complete Profile'}
        </Button>
      </div>
    </div>
  );
}
