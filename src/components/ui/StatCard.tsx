// src/components/ui/StatCard.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from "./Card";

type TrendDirection = 'up' | 'down' | 'neutral';

type StatCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
  icon?: string;
  trend?: {
    value: number; // percentage change
    direction: TrendDirection;
    label?: string; // e.g., "vs last week"
  };
  animate?: boolean;
};

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1000, animate: boolean = true) {
  const [count, setCount] = useState(animate ? 0 : end);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate || typeof end !== 'number') {
      setCount(end);
      return;
    }

    const animateCount = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      countRef.current = Math.floor(easeOutQuart * end);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);

    return () => {
      startTimeRef.current = null;
    };
  }, [end, duration, animate]);

  return count;
}

const TREND_STYLES = {
  up: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: '↑',
  },
  down: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: '↓',
  },
  neutral: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    icon: '→',
  },
};

export function StatCard({
  label,
  value,
  helperText,
  icon,
  trend,
  animate = true
}: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericValue) && typeof value === 'number';
  const displayValue = isNumeric ? useAnimatedCounter(numericValue, 800, animate) : value;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow" variant="default">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-medium text-[#7C7373] uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-[#333333] tabular-nums">
            {displayValue}
          </p>

          {/* Trend Indicator */}
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`
                inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold
                ${TREND_STYLES[trend.direction].bg} ${TREND_STYLES[trend.direction].text}
              `}>
                {TREND_STYLES[trend.direction].icon} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-[10px] text-[#9CA3AF]">{trend.label}</span>
              )}
            </div>
          )}

          {/* Helper Text */}
          {helperText && !trend && (
            <p className="mt-1 text-[11px] text-[#9CA3AF]">{helperText}</p>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F4F6] text-lg">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
