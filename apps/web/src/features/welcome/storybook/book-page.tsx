import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type BookPageProps = {
  children: ReactNode;
  side: 'left' | 'right';
  pageNumber: number;
  tone?: 'sage' | 'blue' | 'gold' | 'rose' | 'ink';
  className?: string;
};

export const BookPage = forwardRef<HTMLDivElement, BookPageProps>(
  (
    {
      children,
      side,
      pageNumber,
      tone = 'sage',
      className,
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        'book-page',
        `book-page--${side}`,
        `book-page--${tone}`,
        className,
      )}
      data-density="soft"
    >
      <div className="book-page__paper">
        <div className="book-page__content">{children}</div>
        <span className="book-page__folio" aria-hidden="true">
          {String(pageNumber).padStart(2, '0')}
        </span>
      </div>
    </div>
  ),
);

BookPage.displayName = 'BookPage';
