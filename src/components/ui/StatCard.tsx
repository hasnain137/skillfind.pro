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

type IconBadgeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  helperText?: string;
  icon?: React.ReactNode;
  iconColor?: IconBadgeColor;
  trend?: TrendData;
  animate?: boolean;
  variant?: 'default' | 'featured' | 'compact';
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

// Trend indicator styles
const TREND_STYLES: Record<TrendDirection, { bg: string; text: string; icon: string }> = {
  up: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: '↑',
  },
  down: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: '↓',
  },
  neutral: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: '→',
  },
};

export function StatCard({
  label,
  value,
  helperText,
  icon,
  iconColor = 'blue',
  trend,
  animate = true,
  variant = 'default',
  className = "",
  ...props
}: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericValue) && typeof value === 'number';
  const displayValue = isNumeric ? useAnimatedCounter(numericValue, 800, animate) : value;

  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  // Card variant classes
  const cardClasses = isFeatured
    ? 'card-featured rounded-2xl'
    : 'glass-card hover:shadow-glass-hover hover:scale-[1.01] rounded-2xl';

  // Padding based on variant
  const paddingClass = isCompact ? 'p-4' : isFeatured ? 'p-6' : 'p-5';

  // Value size
  const valueClass = isFeatured
    ? 'text-stat-value text-stat-value-lg'
    : isCompact
      ? 'text-xl font-bold text-[#111827]'
      : 'text-stat-value';

  return (
    <Card
      level={1}
      className={`
        ${cardClasses} transition-all duration-300 ${className}
      `.trim().replace(/\s+/g, ' ')}
      padding="none"
      {...props}
    >
      <div className={paddingClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Label */}
            <p className={`text-stat-label ${isFeatured ? 'text-white/80' : ''}`}>
              {label}
            </p>

            {/* Value */}
            <p className={`mt-2 tabular-nums ${valueClass}`}>
              {displayValue}
            </p>

            {/* Trend Indicator */}
            {trend && (
              <div className="mt-3 flex items-center gap-2">
                <span className={`
                  inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-semibold
                  ${TREND_STYLES[trend.direction].bg} ${TREND_STYLES[trend.direction].text}
                `}>
                  {TREND_STYLES[trend.direction].icon} {Math.abs(trend.value)}%
                </span>
                {trend.label && (
                  <span className={`text-xs ${isFeatured ? 'text-white/70' : 'text-gray-500'}`}>
                    {trend.label}
                  </span>
                )}
              </div>
            )}

            {/* Helper Text */}
            {helperText && !trend && (
              <p className={`mt-2 text-helper ${isFeatured ? 'text-white/70' : ''}`}>
                {helperText}
              </p>
            )}
          </div>

          {/* Icon Badge */}
          {icon && (
            <div className={`icon-badge ${isCompact ? 'icon-badge-sm' : ''} icon-badge-${iconColor}`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}



