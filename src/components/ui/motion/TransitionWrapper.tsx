
"use client";

import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { fadeIn, scaleIn, slideUp } from "@/lib/motion-variants";

interface TransitionWrapperProps extends HTMLMotionProps<"div"> {
    show: boolean;
    variant?: "fade" | "scale" | "slide-up";
    children: React.ReactNode;
}

export function TransitionWrapper({
    show,
    variant = "fade",
    children,
    ...props
}: TransitionWrapperProps) {
    const getVariant = () => {
        switch (variant) {
            case "scale":
                return scaleIn;
            case "slide-up":
                return slideUp;
            default:
                return fadeIn;
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={getVariant()}
                    {...props}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
