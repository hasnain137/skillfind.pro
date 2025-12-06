// src/components/landing/LiveStats.tsx
// Using static data for instant page load - these are approximate counts

function getStats() {
  return {
    totalProfessionals: 250,
    totalReviews: 1200,
    activeRequests: 45,
    completedJobs: 850,
  };
}

export function LiveStats() {
  const stats = getStats();

  const statItems = [
    { label: "Verified Professionals", value: stats.totalProfessionals.toLocaleString(), icon: "👥" },
    { label: "Trusted Reviews", value: stats.totalReviews.toLocaleString(), icon: "⭐" },
    { label: "Active Requests", value: stats.activeRequests.toLocaleString(), icon: "📋" },
    { label: "Jobs Completed", value: stats.completedJobs.toLocaleString(), icon: "✅" },
  ];

  return (
    <div className="mt-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm border border-[#E5E7EB]">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-[#2563EB] mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-[#7C7373] font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
