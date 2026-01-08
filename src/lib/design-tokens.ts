
// Design System Types

export type SurfaceLevel = 0 | 1 | 2 | 3;
export type Theme = 'light' | 'dark' | 'system';

// Helper to get background color class for a given level
// Note: This relies on the CSS variables defined in globals.css
export const getBgForLevel = (level: SurfaceLevel): string => {
    switch (level) {
        case 0:
            return 'bg-surface-50 dark:bg-surface-950'; // Level 0: Page / Canvas
        case 1:
            return 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-soft'; // Level 1: Container
        case 2:
            return 'bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800'; // Level 2: Nested
        case 3:
            return 'bg-surface-100 dark:bg-surface-900'; // Level 3: Deep nested
        default:
            return 'bg-surface-50 dark:bg-surface-950';
    }
};
