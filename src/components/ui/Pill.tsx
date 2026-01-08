// src/components/ui/Pill.tsx
import { ButtonHTMLAttributes } from "react";

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function Pill({ active = false, className = "", ...props }: PillProps) {
  return (
    <button
      type="button"
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active
          ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
          : "border-transparent bg-[#F3F4F6] text-[#7C7373] hover:border-[#E5E7EB] hover:bg-white"
      } ${className}`}
      {...props}
    />
  );
}

