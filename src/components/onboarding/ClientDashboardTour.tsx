// src/components/onboarding/ClientDashboardTour.tsx
'use client';

import { GuidedTour, clientDashboardSteps } from './GuidedTour';

export function ClientDashboardTour() {
    return (
        <GuidedTour
            tourId="client-dashboard"
            steps={clientDashboardSteps}
        />
    );
}
