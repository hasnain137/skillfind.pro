// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "success" | "warning" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

// Using design system tokens from tailwind.config.js
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-soft-sm hover:shadow-soft",
  secondary:
    "bg-surface-100 text-surface-700 hover:bg-surface-200 focus-visible:ring-surface-400 border border-surface-200",
  ghost:
    "text-surface-600 hover:bg-surface-100 hover:text-surface-900 focus-visible:ring-surface-300",
  outline:
    "bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 hover:border-surface-400 focus-visible:ring-surface-400",
  success:
    "bg-success-light text-success-dark hover:bg-green-200 focus-visible:ring-success",
  warning:
    "bg-warning-light text-warning-dark hover:bg-amber-200 focus-visible:ring-warning",
  destructive:
    "bg-error-light text-error-dark hover:bg-red-200 focus-visible:ring-error",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <svg
    className={`animate-spin h-4 w-4 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      // Layout
      "inline-flex items-center justify-center",
      // Typography
      "font-semibold",
      // Shape
      "rounded-full",
      // Transitions (subtle, professional)
      "transition-all duration-200 ease-out",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      // Active state (subtle press)
      "active:scale-[0.98]",
      // Disabled
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
    ].join(" ");

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
        disabled={isDisabled}
        style={{ minHeight: size === "sm" ? "32px" : size === "lg" ? "48px" : "44px" }}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Export for backward compatibility
export default Button;
