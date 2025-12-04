// src/components/ui/Badge.tsx
import { HTMLAttributes } from "react";

export type BadgeVariant =
  | "gray"
  | "primary"
  | "success"
  | "warning"
  | "neutral"
  | "destructive";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const VARIANTS: Record<BadgeVariant, string> = {
  gray: "bg-[#F3F4F6] text-[#4B5563]",
  primary: "bg-[#EEF2FF] text-[#3730A3]",
  success: "bg-[#ECFDF3] text-[#166534]",
  warning: "bg-[#FEF9C3] text-[#92400E]",
  neutral: "bg-[#F9FAFB] text-[#6B7280]",
  destructive: "bg-[#FEF2F2] text-[#991B1B]",
};

export function Badge({
  variant = "gray",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
