// src/components/ui/EmptyState.tsx
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Link } from '@/i18n/routing';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon = <span className="text-4xl">📭</span>, title, description, action }: EmptyStateProps) {
  return (
    <Card level={1} className="py-12 border-dashed border-zinc-300">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 text-3xl">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-surface-900">{title}</h3>
        <p className="mb-6 max-w-sm text-sm text-surface-500">{description}</p>
        {action && (
          <Link href={action.href}>
            <Button>{action.label}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
