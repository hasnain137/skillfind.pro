// src/components/ui/StatCard.tsx
'use client';

import { useEffect, useState, useRef, HTMLAttributes } from 'react';
import { Card, CardContent } from "./Card";

type TrendDirection = 'up' | 'down' | 'neutral';

interface TrendData {
  value: number;
  direction: TrendDirection;
  label?: string;
}

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  helperText?: string;
  icon?: React.ReactNode;
  trend?: TrendData;
  animate?: boolean;
  variant?: 'default' | 'gradient';
  gradientColor?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 800, animate: boolean = true) {
  const [count, setCount] = useState(animate ? 0 : end);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate || typeof end !== 'number' || isNaN(end)) {
      setCount(end);
      return;
    }

    const animateCount = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      // Easing function - ease out quart for smooth deceleration
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

// Trend indicator styles using design tokens
const TREND_STYLES: Record<TrendDirection, { bg: string; text: string; icon: string }> = {
  up: {
    bg: 'bg-success-light',
    text: 'text-success-dark',
    icon: '↑',
  },
  down: {
    bg: 'bg-error-light',
    text: 'text-error-dark',
    icon: '↓',
  },
  neutral: {
    bg: 'bg-surface-100',
    text: 'text-surface-500',
    icon: '→',
  },
};

// Gradient backgrounds
const GRADIENT_COLORS: Record<string, string> = {
  blue: 'from-primary-50 to-primary-100 border-primary-200',
  green: 'from-green-50 to-green-100 border-green-200',
  orange: 'from-orange-50 to-orange-100 border-orange-200',
  purple: 'from-purple-50 to-purple-100 border-purple-200',
  red: 'from-red-50 to-red-100 border-red-200',
  default: '', // Handle default properly
};

export function StatCard({
  label,
  value,
  helperText,
  icon,
  trend,
  animate = true,
  variant = 'default',
  gradientColor,
  className = "",
  ...props
}: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericValue) && typeof value === 'number';
  const displayValue = isNumeric ? useAnimatedCounter(numericValue, 800, animate) : value;

  const cardClass = variant === 'gradient' && gradientColor
    ? `bg-gradient-to-br ${GRADIENT_COLORS[gradientColor]}`
    : '';

  return (
    <Card
      level={1}
      className={`
        hover:shadow-soft transition-shadow duration-200
        animate-fade-in-up
        ${cardClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Label */}
            <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
              {label}
            </p>

            {/* Value */}
            <p className="mt-1.5 text-2xl font-bold text-surface-900 tabular-nums">
              {displayValue}
            </p>

            {/* Trend Indicator */}
            {trend && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className={`
                    inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold
                    ${TREND_STYLES[trend.direction].bg} ${TREND_STYLES[trend.direction].text}
                `}>
                  {TREND_STYLES[trend.direction].icon} {Math.abs(trend.value)}%
                </span>
                {trend.label && (
                  <span className="text-[10px] text-surface-400">{trend.label}</span>
                )}
              </div>
            )}

            {/* Helper Text */}
            {helperText && !trend && (
              <p className="mt-1.5 text-[11px] text-surface-400">{helperText}</p>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 text-lg shrink-0">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
