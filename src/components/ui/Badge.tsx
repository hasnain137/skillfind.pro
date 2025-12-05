// src/components/ui/Badge.tsx
import { HTMLAttributes, forwardRef } from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline"
  // Legacy variant names for backward compatibility
  | "gray"
  | "neutral"
  | "destructive";

type BadgeSize = "sm" | "md";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
};

// Using design system tokens
const VARIANTS: Record<BadgeVariant, string> = {
  default:
    "bg-surface-100 text-surface-700",
  primary:
    "bg-primary-100 text-primary-700",
  success:
    "bg-success-light text-success-dark",
  warning:
    "bg-warning-light text-warning-dark",
  error:
    "bg-error-light text-error-dark",
  info:
    "bg-info-light text-info-dark",
  outline:
    "bg-transparent border border-surface-300 text-surface-600",
  // Legacy mappings
  gray: "bg-surface-100 text-surface-700",
  neutral: "bg-surface-100 text-surface-700",
  destructive: "bg-error-light text-error-dark",
};

const SIZES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-[11px]",
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: "bg-surface-500",
  primary: "bg-primary-500",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  outline: "bg-surface-400",
  // Legacy mappings
  gray: "bg-surface-500",
  neutral: "bg-surface-500",
  destructive: "bg-error",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      dot = false,
      pulse = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      "inline-flex items-center gap-1.5",
      "font-semibold",
      "rounded-full",
      "whitespace-nowrap",
    ].join(" ");

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
        {...props}
      >
        {dot && (
          <span className="relative flex h-1.5 w-1.5">
            {pulse && (
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${DOT_COLORS[variant]}`}
              />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${DOT_COLORS[variant]}`}
            />
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// Backward compatibility mapping for existing variant names
export const LEGACY_VARIANT_MAP: Record<string, BadgeVariant> = {
  gray: "default",
  neutral: "default",
  destructive: "error",
};

export default Badge;
