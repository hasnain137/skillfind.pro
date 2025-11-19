// src/components/ui/StatCard.tsx
import { Card } from "./Card";

type StatCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
};

export function StatCard({ label, value, helperText }: StatCardProps) {
  return (
    <Card className="p-4" variant="default">
      <p className="text-[11px] text-[#7C7373]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#333333]">{value}</p>
      {helperText ? (
        <p className="text-[11px] text-[#9CA3AF]">{helperText}</p>
      ) : null}
    </Card>
  );
}

