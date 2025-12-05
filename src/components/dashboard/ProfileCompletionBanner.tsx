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
  const isLowCompletion = profileCompletion < 50;

  return (
    <div className={`rounded-2xl border-2 p-5 shadow-sm transition-all ${isLowCompletion
        ? 'border-[#F59E0B] bg-gradient-to-br from-[#FEF3C7] to-white'
        : 'border-[#3B82F6] bg-gradient-to-br from-[#EFF6FF] to-white'
      }`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${isLowCompletion ? 'bg-[#FEF3C7]' : 'bg-[#DBEAFE]'
              }`}>
              {isLowCompletion ? '📝' : '✨'}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#333333]">
                {isLowCompletion ? 'Complete Your Profile' : 'Almost There!'}
              </h3>
              <p className="text-xs text-[#7C7373]">
                {userRole === 'PROFESSIONAL'
                  ? 'A complete profile gets more job offers'
                  : 'Help professionals understand your needs better'
                }
              </p>
            </div>
          </div>

          {/* Progress Bar with Label */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#7C7373]">Profile completion</span>
              <span className={`font-bold ${isLowCompletion ? 'text-[#D97706]' : 'text-[#2563EB]'}`}>
                {profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-[#E5E7EB] rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${isLowCompletion ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]'
                  }`}
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          {/* Missing Steps Checklist */}
          {missingSteps.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {missingSteps.slice(0, 3).map((step) => (
                <span
                  key={step.id}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-[#7C7373]"
                >
                  <span className="text-[#D1D5DB]">○</span>
                  {step.label}
                </span>
              ))}
              {missingSteps.length > 3 && (
                <span className="text-xs text-[#7C7373] px-2 py-1">
                  +{missingSteps.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => router.push(missingSteps[0]?.actionUrl || profileUrl)}
          className="whitespace-nowrap shadow-md hover:shadow-lg"
        >
          Complete Now →
        </Button>
      </div>
    </div>
  );
}

