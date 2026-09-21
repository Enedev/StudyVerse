import { Construction, type LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

type ModulePlaceholderProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  plannedFeatures: string[];
};

export function ModulePlaceholder({
  icon: Icon,
  eyebrow,
  title,
  description,
  plannedFeatures,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <Badge variant="outline" className="mb-4 gap-2">
          <Construction className="size-3.5" />
          Foundation ready
        </Badge>
        <div className="flex items-start gap-4">
          <div className="bg-secondary text-secondary-foreground mt-1 flex size-12 shrink-0 items-center justify-center rounded-xl">
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              {eyebrow}
            </p>
            <h2 className="mt-1 font-serif text-4xl font-medium">{title}</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </header>

      <Card className="max-w-3xl p-6">
        <h3 className="text-sm font-semibold">Planned for this module</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {plannedFeatures.map((feature) => (
            <li
              key={feature}
              className="bg-muted/55 text-muted-foreground rounded-lg px-4 py-3 text-sm"
            >
              {feature}
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-5 border-t pt-5 text-xs">
          This page intentionally contains no simulated controls. Functionality
          will be added in its dedicated implementation phase.
        </p>
      </Card>
    </div>
  );
}
