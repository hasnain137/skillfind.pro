
import { Variants } from "framer-motion";

export const defaultTransition = {
    duration: 0.2,
    ease: [0.25, 1, 0.5, 1] as const, // cubic-bezier(0.25, 1, 0.5, 1)
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: defaultTransition },
    exit: { opacity: 0, transition: defaultTransition },
};

export const slideUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: defaultTransition },
    exit: { opacity: 0, y: 10, transition: defaultTransition },
};

export const slideDown = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: defaultTransition },
    exit: { opacity: 0, y: -10, transition: defaultTransition },
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: defaultTransition },
    exit: { opacity: 0, scale: 0.95, transition: defaultTransition },
};

export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
};
