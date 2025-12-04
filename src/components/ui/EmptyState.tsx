// src/components/ui/EmptyState.tsx
import { Card } from './Card';
import { Button } from './Button';
import Link from 'next/link';
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
    <Card variant="dashed" padding="lg" className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-3xl">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </Card>
  );
}
