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

// Using design system tokens
const VARIANTS: Record<CardVariant, string> = {
  default:
    "bg-white border border-surface-200 shadow-soft-xs",
  elevated:
    "bg-white border border-surface-100 shadow-soft-md",
  muted:
    "bg-surface-50 border border-surface-200",
  dashed:
    "bg-surface-50 border-2 border-dashed border-surface-300",
  gradient:
    "bg-gradient-to-br from-white to-surface-50 border border-surface-200 shadow-soft-xs",
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
  xl: "p-6",
};

const HOVER_EFFECTS: Record<string, string> = {
  lift: "hover:-translate-y-0.5 hover:shadow-soft-lg",
  glow: "hover:shadow-glow-sm",
  border: "hover:border-primary-400",
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
      // Transitions
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
    className={`flex items-center gap-3 pt-4 border-t border-surface-200 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
