// src/app/pro/profile/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/SectionHeading";
import ProfileForm from "./ProfileForm";

export default async function ProProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const professional = await prisma.professional.findUnique({
    where: { userId },
    include: {
      services: {
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!professional) {
    redirect('/complete-profile');
  }

  // Fetch categories for the service adder
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true,
    },
    orderBy: {
      nameEn: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Profile"
        title="Keep your professional profile updated"
        description="Clients want to understand your expertise, services, and availability before sending work."
      />

      <ProfileForm
        initialProfile={professional as any}
        categories={categories}
      />
    </div>
  );
}

