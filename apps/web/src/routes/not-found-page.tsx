import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-5">
      <div className="max-w-lg text-center">
        <div className="bg-muted mx-auto flex size-16 items-center justify-center rounded-2xl">
          <SearchX className="text-muted-foreground size-7" />
        </div>
        <p className="text-muted-foreground mt-6 text-xs font-semibold tracking-[0.2em] uppercase">
          Page 404
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium">
          This page is between chapters.
        </h1>
        <p className="text-muted-foreground mt-4">
          The page you were looking for does not exist or has moved.
        </p>
        <Button className="mt-7" asChild>
          <Link to="/">
            <ArrowLeft />
            Return home
          </Link>
        </Button>
      </div>
    </main>
  );
}
