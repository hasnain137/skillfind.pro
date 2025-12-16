
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfessionalWithRelations } from "@/lib/get-professional";
import VerificationPageClient from "./page-client";

export default async function VerificationPage() {
    const { userId } = await auth();
    if (!userId) redirect('/login');

    const professional: any = await getProfessionalWithRelations(userId, {
        documents: {
            orderBy: { uploadedAt: 'desc' }
        }
    });

    if (!professional) redirect('/auth-redirect');

    return <VerificationPageClient professional={professional} />;
}
