import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'border-input bg-background/70 h-11 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
