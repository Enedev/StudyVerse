import { Brand } from '@/components/navigation/brand';
import { Skeleton } from '@/components/ui/skeleton';

export function PageLoader() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="flex w-48 flex-col items-center gap-5">
        <Brand />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <span className="text-muted-foreground text-sm">
          Preparing your workspace…
        </span>
      </div>
    </div>
  );
}
