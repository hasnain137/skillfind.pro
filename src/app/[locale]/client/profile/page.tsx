// src/app/client/profile/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getClientWithRelations } from "@/lib/get-professional";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import ClientProfileForm from "./ClientProfileForm";

export default async function ClientProfilePage() {
  const { userId } = await auth();

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
        title="My Profile"
        description="Manage your personal information and preferences."
      />

      <Card padding="lg">
        <ClientProfileForm initialClient={client} />
      </Card>
    </div>
  );
}
