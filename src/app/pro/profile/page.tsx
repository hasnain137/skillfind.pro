// src/app/pro/profile/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProfessionalWithRelations } from "@/lib/get-professional";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import ProfileForm from "./ProfileForm";

export default async function ProProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const professional: any = await getProfessionalWithRelations(userId, {
    user: { select: { dateOfBirth: true, phoneNumber: true } },
    profile: true,
    services: { include: { subcategory: { include: { category: true } } } },
  });

  if (!professional) redirect('/auth-redirect');

  const categories = await prisma.category.findMany({
    include: {
      subcategories: true,
    },
    orderBy: {
      nameEn: 'asc',
    },
  });

  // Calculate profile completion
  let profileCompletion = 0;
  if (professional.bio) profileCompletion += 25;
  if (professional.services.length > 0) profileCompletion += 25;
  if (professional.city) profileCompletion += 15;
  if (professional.isVerified) profileCompletion += 20;
  if (professional.profile?.hourlyRateMin) profileCompletion += 15;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Profile"
        title="Keep your professional profile updated"
        description="Clients want to understand your expertise, services, and availability before sending work."
      />

      {/* Profile Completion Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
              <span>📊</span> Profile Completion
            </h3>
            <p className="text-xs text-[#7C7373] mt-1">
              Complete profiles get 3x more offers!
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#2563EB]">{profileCompletion}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-[#2563EB] to-[#1D4FD8] transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>

        {profileCompletion < 100 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-[#333333]">Complete these to reach 100%:</p>
            <div className="grid gap-2 sm:grid-cols-2 text-xs text-[#7C7373]">
              {!professional.bio && <p>• Add a compelling bio</p>}
              {professional.services.length === 0 && <p>• Add at least one service</p>}
              {!professional.city && <p>• Set your location</p>}
              {!professional.isVerified && <p>• Complete verification</p>}
              {!professional.profile?.hourlyRateMin && <p>• Set your pricing</p>}
            </div>
          </div>
        )}
      </Card>

      <ProfileForm
        initialProfile={professional as any}
        categories={categories}
      />
    </div>
  );
}
