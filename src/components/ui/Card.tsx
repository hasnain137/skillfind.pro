// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "elevated" | "muted" | "dashed" | "gradient";
type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  hoverEffect?: "lift" | "glow" | "border" | "none";
};

// Using design system tokens - SUBTLE SHADOW-BASED 3D LOOK
// Removed heavy borders, using soft shadows for depth
const VARIANTS: Record<CardVariant, string> = {
  default:
    "bg-white shadow-soft ring-1 ring-black/[0.03]",
  elevated:
    "bg-white shadow-soft-md ring-1 ring-black/[0.02]",
  muted:
    "bg-surface-50/80 shadow-soft-xs ring-1 ring-black/[0.02]",
  dashed:
    "bg-surface-50/50 border-2 border-dashed border-surface-200",
  gradient:
    "bg-gradient-to-br from-white to-surface-50 shadow-soft ring-1 ring-black/[0.03]",
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
  xl: "p-6",
};

const HOVER_EFFECTS: Record<string, string> = {
  lift: "hover:-translate-y-0.5 hover:shadow-soft-lg hover:ring-black/[0.05]",
  glow: "hover:shadow-glow-sm",
  border: "hover:ring-primary-500/30 hover:shadow-soft-md",
  none: "",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      interactive = false,
      hoverEffect = interactive ? "lift" : "none",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      // Shape
      "rounded-2xl",
      // Transitions - smooth for that premium feel
      "transition-all duration-200 ease-out",
    ].join(" ");

    const interactiveStyles = interactive
      ? "cursor-pointer active:scale-[0.995]"
      : "";

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${VARIANTS[variant]}
          ${PADDING[padding]}
          ${HOVER_EFFECTS[hoverEffect]}
          ${interactiveStyles}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header subcomponent
export const CardHeader = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex items-center justify-between gap-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Card Title subcomponent
export const CardTitle = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={`text-lg font-bold text-surface-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

// Card Description subcomponent
export const CardDescription = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={`text-sm text-surface-500 ${className}`}
    {...props}
  >
    {children}
  </p>
);

// Card Content subcomponent
export const CardContent = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`${className}`}
    {...props}
  >
    {children}
  </div>
);

// Card Footer subcomponent
export const CardFooter = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex items-center gap-3 pt-4 border-t border-surface-100 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
