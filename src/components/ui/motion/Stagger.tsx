
"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { staggerContainer } from "@/lib/motion-variants";
import { cn } from "@/lib/cn";

interface StaggerProps extends HTMLMotionProps<"div"> {
    className?: string;
    children: React.ReactNode;
}

export function Stagger({ className, children, ...props }: StaggerProps) {
    return (
        <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    );
}
