// src/components/onboarding/ProDashboardTour.tsx
'use client';

import { GuidedTour, proDashboardSteps } from './GuidedTour';

export function ProDashboardTour() {
    return (
        <GuidedTour
            tourId="pro-dashboard"
            steps={proDashboardSteps}
        />
    );
}
