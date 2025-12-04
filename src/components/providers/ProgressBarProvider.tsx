'use client';

import NextTopLoader from 'nextjs-toploader';

export function ProgressBarProvider() {
    return (
        <NextTopLoader
            color="#2563EB"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2563EB,0 0 5px #2563EB"
        />
    );
}
