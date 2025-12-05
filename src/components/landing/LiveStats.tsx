// src/components/landing/LiveStats.tsx
// Using static data for instant page load - these are approximate counts
// TODO: Update these numbers periodically or fetch from a cached API endpoint

function getStats() {
  // Static fallback values for fast page load
  // Update these manually every few weeks or implement a background job
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
    <div className="mt-8 animate-fade-in-up-delay-2">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-soft ring-1 ring-black/[0.03]">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-primary-600 mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-surface-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
