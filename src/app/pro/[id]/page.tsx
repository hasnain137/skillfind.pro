// src/app/pro/[id]/page.tsx
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

type ProProfilePageProps = {
  params: { id: string };
};

export default function ProPublicProfilePage({ params }: ProProfilePageProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Professional profile"
        title={`Profile #${params.id}`}
        description="Public-facing profile details will be rendered here once connected to real data."
      />

      <Card padding="lg" className="space-y-3">
        <p className="text-sm text-[#4B5563]">
          This route is a placeholder to satisfy Next.js routing expectations. Once
          the professional directory is implemented, clients will see full
          professional information, reviews, and contact actions on this page.
        </p>
        <p className="text-xs text-[#9CA3AF]">
          Path parameters are available via `params.id`; use them to fetch
          professional data from the API in a future update.
        </p>
      </Card>
    </div>
  );
}

