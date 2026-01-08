// src/components/onboarding/GuidedTour.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Step, CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';

// Dynamic import to avoid SSR issues
const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

interface GuidedTourProps {
    tourId: string; // Unique ID like 'client-dashboard' or 'pro-dashboard'
    steps: Step[];
    run?: boolean;
}

// Custom styles matching the app's design
const tourStyles = {
    options: {
        primaryColor: '#2563EB',
        zIndex: 10000,
        arrowColor: '#fff',
        backgroundColor: '#fff',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        textColor: '#333333',
    },
    tooltip: {
        borderRadius: '16px',
        padding: '20px',
    },
    tooltipContainer: {
        textAlign: 'left' as const,
    },
    tooltipTitle: {
        fontSize: '16px',
        fontWeight: 700,
        marginBottom: '8px',
    },
    tooltipContent: {
        fontSize: '14px',
        color: '#7C7373',
    },
    buttonNext: {
        backgroundColor: '#2563EB',
        borderRadius: '12px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 600,
    },
    buttonBack: {
        color: '#7C7373',
        marginRight: '10px',
    },
    buttonSkip: {
        color: '#9CA3AF',
        fontSize: '13px',
    },
    spotlight: {
        borderRadius: '16px',
    },
};

export function GuidedTour({ tourId, steps, run = true }: GuidedTourProps) {
    const [shouldRun, setShouldRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    // Check if tour has been completed before
    useEffect(() => {
        const tourCompleted = localStorage.getItem(`tour-${tourId}-completed`);
        if (!tourCompleted && run) {
            // Small delay to let the page render first
            const timer = setTimeout(() => setShouldRun(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [tourId, run]);

    const handleCallback = (data: CallBackProps) => {
        const { status, action, index, type } = data;

        // Handle tour completion or skip
        if (status === 'finished' || status === 'skipped') {
            localStorage.setItem(`tour-${tourId}-completed`, 'true');
            setShouldRun(false);
        }

        // Handle step navigation
        if (type === 'step:after') {
            if (action === 'next') {
                setStepIndex(index + 1);
            } else if (action === 'prev') {
                setStepIndex(index - 1);
            }
        }
    };

    if (!shouldRun) return null;

    return (
        <Joyride
            steps={steps}
            run={shouldRun}
            stepIndex={stepIndex}
            continuous
            showProgress
            showSkipButton
            scrollToFirstStep
            spotlightClicks
            disableOverlayClose
            callback={handleCallback}
            styles={tourStyles}
            locale={{
                back: '← Back',
                close: 'Close',
                last: 'Done!',
                next: 'Next →',
                skip: 'Skip tour',
            }}
            floaterProps={{
                disableAnimation: false,
            }}
        />
    );
}

// Pre-defined tour steps for different pages
export const clientDashboardSteps: Step[] = [
    {
        target: 'body',
        content: 'Welcome to your dashboard! Let me show you around quickly.',
        title: '👋 Welcome to SkillFind!',
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '[data-tour="quick-actions"]',
        content: 'Use these buttons to quickly create a new request or view your existing ones.',
        title: '⚡ Quick Actions',
        placement: 'bottom',
    },
    {
        target: '[data-tour="stats"]',
        content: 'Track your open requests, offers received, and completed jobs at a glance.',
        title: '📊 Your Stats',
        placement: 'bottom',
    },
    {
        target: '[data-tour="activity"]',
        content: 'See your recent activity and stay updated on new offers and messages.',
        title: '🔔 Activity Feed',
        placement: 'left',
    },
];

export const proDashboardSteps: Step[] = [
    {
        target: 'body',
        content: 'Welcome to your professional dashboard! Let me show you the key features.',
        title: '👋 Welcome, Pro!',
        placement: 'center',
        disableBeacon: true,
    },
    {
        target: '[data-tour="matching-requests"]',
        content: 'Find requests that match your skills and services here.',
        title: '🔍 Matching Requests',
        placement: 'bottom',
    },
    {
        target: '[data-tour="stats"]',
        content: 'Monitor your performance: new matches, active jobs, and ratings.',
        title: '📊 Your Performance',
        placement: 'bottom',
    },
    {
        target: '[data-tour="earnings"]',
        content: 'Track your earnings and payment history in this section.',
        title: '💰 Earnings Overview',
        placement: 'left',
    },
];
