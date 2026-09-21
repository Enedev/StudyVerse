import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed p-10 text-center shadow-none">
      <div className="bg-muted mx-auto mb-4 flex size-12 items-center justify-center rounded-xl">
        <Icon className="text-muted-foreground size-5" />
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
