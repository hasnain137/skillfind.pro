// src/components/ui/EmptyState.tsx
import { Card } from './Card';
import { Button } from './Button';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <Card variant="dashed" padding="lg" className="text-center py-12">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-[#333333] mb-2">{title}</h3>
      <p className="text-sm text-[#7C7373] mb-4 max-w-md mx-auto">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </Card>
  );
}
