'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Dashboard.ProfileCompletion');

  if (profileCompletion === 100) return null;

  const profileUrl = userRole === 'PROFESSIONAL' ? '/pro/profile' : '/client/profile';
  const isLowCompletion = profileCompletion < 50;

  return (
    <div className={`rounded-3xl border p-6 shadow-lg backdrop-blur-xl transition-all ${isLowCompletion
      ? 'border-[#F59E0B]/50 bg-gradient-to-br from-amber-50/90 to-white/60'
      : 'border-[#3B4D9D]/50 bg-gradient-to-br from-blue-50/90 to-white/60'
      }`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-sm ring-1 ring-black/5 ${isLowCompletion ? 'bg-amber-100/50' : 'bg-blue-100/50'
              }`}>
              {isLowCompletion ? '📝' : '✨'}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#333333]">
                {isLowCompletion ? t('titleLow') : t('titleHigh')}
              </h3>
              <p className="text-xs text-gray-500">
                {userRole === 'PROFESSIONAL'
                  ? t('descPro')
                  : t('descClient')
                }
              </p>
            </div>
          </div>

          {/* Progress Bar with Label */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-500">{t('label')}</span>
              <span className={`font-bold ${isLowCompletion ? 'text-[#F59E0B]' : 'text-[#3B4D9D]'}`}>
                {profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-[#E5E7EB] rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${isLowCompletion ? 'bg-[#F59E0B]' : 'bg-[#3B4D9D]'
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
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-gray-500"
                >
                  <span className="text-[#D1D5DB]">○</span>
                  {step.label}
                </span>
              ))}
              {missingSteps.length > 3 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  {t('moreSteps', { count: missingSteps.length - 3 })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => router.push(missingSteps[0]?.actionUrl || profileUrl)}
          className={`whitespace-nowrap shadow-md hover:shadow-lg ${!isLowCompletion ? 'bg-[#3B4D9D] hover:bg-[#2a3a7a]' : ''}`}
        >
          {t('completeNow')}
        </Button>
      </div>
    </div>
  );
}
