// src/app/pro/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateWallet } from "@/lib/services/wallet";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DashboardHero } from "@/components/ui/DashboardHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { ActionCard } from "@/components/ui/ActionCard";

const QUICK_ACTIONS = [
  {
    title: "Browse matching requests",
    description: "See new opportunities that match your services and skills.",
    href: "/pro/requests",
    cta: "View requests",
  },
  {
    title: "Manage your offers",
    description: "Track pending offers and see which ones got accepted.",
    href: "/pro/offers",
    cta: "View offers",
  },
  {
    title: "Active jobs",
    description: "Start work and mark jobs complete when finished.",
    href: "/pro/jobs",
    cta: "View jobs",
  },
  {
    title: "Update profile",
    description: "Keep your bio, services, and portfolio up to date.",
    href: "/pro/profile",
    cta: "Edit profile",
  },
];

export default async function ProDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await currentUser();
  const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there';

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
      offers: {
        where: {
          status: 'PENDING',
        },
      },
      jobs: {
        where: {
          status: {
            in: ['ACCEPTED', 'IN_PROGRESS'],
          },
        },
        include: {
          review: true,
        },
      },
    },
  });

  if (!professional) {
    redirect('/complete-profile');
  }

  // Get wallet balance
  const wallet = await getOrCreateWallet(professional.id);
  const balanceEuros = wallet.balance / 100;

  // Calculate profile completion
  let profileCompletion = 0;
  if (professional.bio) profileCompletion += 30;
  if (professional.services.length > 0) profileCompletion += 30;
  if (professional.city) profileCompletion += 20;
  if (professional.isVerified) profileCompletion += 20;

  // Get matching requests count (today)
  const serviceCategoryIds = professional.services.map(s => s.subcategory.category.id);
  const uniqueCategoryIds = [...new Set(serviceCategoryIds)];
  
  const matchingRequestsToday = await prisma.request.count({
    where: {
      status: 'OPEN',
      categoryId: {
        in: uniqueCategoryIds,
      },
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  // Calculate average rating from job reviews
  const allReviews = professional.jobs
    .map(job => job.review)
    .filter(review => review !== null);
  
  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : 'N/A';

  const stats = [
    { label: "New matching requests", value: matchingRequestsToday },
    { label: "Active jobs", value: professional.jobs.length },
    { label: "Average rating", value: avgRating },
  ];

  const highlights = [
    { 
      label: "Profile completion", 
      value: `${profileCompletion}%`, 
      helper: profileCompletion < 100 ? "Complete your profile" : "All done!"
    },
    { 
      label: "Wallet balance", 
      value: `€${balanceEuros.toFixed(2)}`, 
      helper: balanceEuros < 5 ? "Top up recommended" : "Good balance"
    },
    { 
      label: "Pending offers", 
      value: `${professional.offers.length}`, 
      helper: professional.offers.length > 0 ? "Awaiting response" : "Send more offers"
    },
  ];

  // Dynamic next steps based on profile state
  const nextSteps = [];
  if (profileCompletion < 100) {
    nextSteps.push("Complete your profile to win more jobs");
  }
  if (professional.services.length === 0) {
    nextSteps.push("Add services to see matching requests");
  }
  if (matchingRequestsToday > 0) {
    nextSteps.push(`${matchingRequestsToday} new matching requests today - respond quickly!`);
  }
  if (professional.offers.length > 0) {
    nextSteps.push(`${professional.offers.length} pending offers awaiting client decision`);
  }
  if (professional.jobs.length > 0) {
    nextSteps.push(`${professional.jobs.length} active jobs need your attention`);
  }
  if (nextSteps.length === 0) {
    nextSteps.push("Browse matching requests and send offers to get hired");
  }

  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Professional dashboard"
        title={`Good ${timeOfDay}, ${firstName}`}
        description="See matching requests, send tailored offers, and keep your profile ready for new opportunities."
        action={{ label: "View requests", href: "/pro/requests" }}
        highlights={highlights}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <Card variant="muted" padding="lg" className="space-y-3">
        <h2 className="text-sm font-semibold text-[#333333]">Next steps</h2>
        <ul className="space-y-2 text-xs text-[#4B5563]">
          {nextSteps.map((step) => (
            <li key={step} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[#2563EB]" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card variant="muted" padding="lg" className="space-y-4">
        <SectionHeading
          variant="section"
          title="Quick actions"
          description="Shortcuts to the most common tasks."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {QUICK_ACTIONS.map((action) => (
            <ActionCard key={action.href} {...action} />
          ))}
        </div>
      </Card>
    </div>
  );
}
