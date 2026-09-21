import { BookOpenText } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

type BrandProps = {
  compact?: boolean;
  className?: string;
};

export function Brand({ compact = false, className }: BrandProps) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center gap-2.5 font-semibold tracking-tight',
        className,
      )}
      aria-label="StudyVerse home"
    >
      <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl shadow-sm">
        <BookOpenText className="size-5" />
      </span>
      {!compact && <span className="text-lg">StudyVerse</span>}
    </Link>
  );
}
