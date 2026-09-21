import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';

type PageHeaderProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <Badge variant="outline" className="mb-4 gap-2 bg-card/70">
          <Icon className="size-3.5" />
          {eyebrow}
        </Badge>
        <h2 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
          {description}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
