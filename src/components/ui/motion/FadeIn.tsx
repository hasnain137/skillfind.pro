
"use client";

import { motion, HTMLMotionProps, LazyMotion, domAnimation, m } from "framer-motion";
import { fadeIn, slideUp, scaleIn } from "@/lib/motion-variants";
import { cn } from "@/lib/cn";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "viewport"> {
    variant?: "fade" | "slide-up" | "scale";
    delay?: number;
    className?: string;
    viewport?: boolean; // Whether to trigger only when in viewport
}

export function FadeIn({
    variant = "fade",
    delay = 0,
    className,
    children,
    viewport = true,
    ...props
}: FadeInProps) {
    const getVariant = () => {
        switch (variant) {
            case "slide-up":
                return slideUp;
            case "scale":
                return scaleIn;
            default:
                return fadeIn;
        }
    };

    const selectedVariant = getVariant();

    // Use LazyMotion to drastically reduce initial bundle size by loading animation features on demand
    return (
        <LazyMotion features={domAnimation}>
            <m.div
                initial="initial"
                whileInView={viewport ? "animate" : undefined}
                animate={!viewport ? "animate" : undefined}
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                    ...selectedVariant,
                    animate: {
                        ...(selectedVariant.animate as any),
                        transition: { ...(selectedVariant.animate as any)?.transition, delay } as any,
                    },
                }}
                className={cn(className)}
                {...props}
            >
                {children}
            </m.div>
        </LazyMotion>
    );
}
