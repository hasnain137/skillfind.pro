// src/app/client/profile/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getClientWithRelations } from "@/lib/get-professional";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import ClientProfileForm from "./ClientProfileForm";
import { getTranslations } from 'next-intl/server';

export default async function ClientProfilePage() {
  const { userId } = await auth();
  const t = await getTranslations('ClientProfile');

  if (!userId) {
    redirect('/login');
  }

  const client = await getClientWithRelations(userId, {
    user: {
      select: {
        dateOfBirth: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        termsAccepted: true,
      },
    },
  });

  if (!client) {
    redirect('/auth-redirect');
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        variant="page"
        title={t('title')}
        description={t('description')}
      />

      <Card padding="lg">
        <ClientProfileForm initialClient={client} />
      </Card>
    </div>
  );
}
