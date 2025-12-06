
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"
import { motion, HTMLMotionProps } from "framer-motion"
import { fadeIn } from "@/lib/motion-variants"

// ============================================
// CVA DEFINITIONS
// ============================================

const cardVariants = cva(
  "rounded-2xl transition-all duration-200 ease-out",
  {
    variants: {
      level: {
        0: "bg-transparent border-none shadow-none", // Page background blend
        1: "bg-white border border-zinc-200 shadow-soft bg-noise", // Standard Container
        2: "bg-zinc-50 border border-zinc-200", // Nested (Alternating)
        3: "bg-zinc-100 border-none", // Deep nested
      },
      interactive: {
        true: "cursor-pointer hover:shadow-medium hover:border-zinc-300 active:scale-[0.995]",
        false: "",
      },
      glass: {
        true: "glass border-white/20 shadow-float",
        false: "",
      },
    },
    defaultVariants: {
      level: 1,
      interactive: false,
      glass: false,
    },
  }
)

// ============================================
// MAIN COMPONENT
// ============================================

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  asMotion?: boolean
  motionDelay?: number
  padding?: "none" | "sm" | "md" | "lg" | "xl"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, level, interactive, glass, asMotion = false, motionDelay = 0, padding, ...props }, ref) => {

    // Strict enforcement: Noise only on Level 1 unless glass
    const hasNoise = level === 1 && !glass;

    // Legacy padding support
    const paddingClass = padding ? {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8"
    }[padding] : "";

    if (asMotion) {
      return (
        <motion.div
          ref={ref}
          initial="initial"
          animate="animate"
          variants={{
            ...fadeIn,
            animate: { ...fadeIn.animate, transition: { ...fadeIn.animate?.transition, delay: motionDelay } }
          }}
          className={cn(cardVariants({ level, interactive, glass }), paddingClass, className)}
          {...(props as HTMLMotionProps<"div">)}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ level, interactive, glass }), paddingClass, className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

// ============================================
// SUBCOMPONENTS (Compound Pattern)
// ============================================

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-2", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-zinc-900",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-zinc-500 font-medium", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
