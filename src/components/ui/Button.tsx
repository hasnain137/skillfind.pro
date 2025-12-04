// src/components/ui/Button.tsx
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  const variants: Record<typeof variant, string> = {
    primary:
      "bg-[#2563EB] text-white hover:bg-[#1D4FD8] focus-visible:ring-[#2563EB]",
    ghost:
      "text-[#333333] hover:bg-[#F3F4F6] focus-visible:ring-[#E5E7EB] border border-transparent hover:border-[#E5E7EB]",
    outline:
      "bg-white text-[#333333] border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] focus-visible:ring-[#E5E7EB]",
  };

  const padding = "px-4 py-2.5";

  return (
    <button
      className={`${base} ${padding} ${variants[variant]} active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ minHeight: '44px' }} // Ensure minimum 44px touch target
      {...props}
    />
  );
}

