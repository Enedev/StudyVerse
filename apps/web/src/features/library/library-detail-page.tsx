import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  FileText,
  Heart,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PreviewNotice } from '@/components/workspace/preview-notice';

const details: Record<
  string,
  {
    title: string;
    author: string;
    category: string;
    progress: number;
    cover: string;
    mark: string;
    description: string;
  }
> = {
  'the-living-world': {
    title: 'The Living World',
    author: 'Elena Marín',
    category: 'Biology',
    progress: 68,
    cover: 'from-emerald-700 via-teal-700 to-slate-900',
    mark: 'BIO',
    description:
      'A visual introduction to the systems, structures, and processes that make life possible.',
  },
  'ways-of-knowing': {
    title: 'Ways of Knowing',
    author: 'Thomas Bell',
    category: 'Philosophy',
    progress: 34,
    cover: 'from-indigo-700 via-violet-700 to-slate-900',
    mark: 'PHI',
    description:
      'An exploration of evidence, reason, perception, and the limits of certainty.',
  },
  'visual-thinking': {
    title: 'Visual Thinking',
    author: 'Mira Chen',
    category: 'Design',
    progress: 12,
    cover: 'from-amber-600 via-orange-700 to-stone-900',
    mark: 'VIS',
    description:
      'Practical methods for making complex ideas visible, memorable, and easier to share.',
  },
  'a-brief-history': {
    title: 'A Brief History of Ideas',
    author: 'Jonas Reed',
    category: 'History',
    progress: 81,
    cover: 'from-rose-700 via-red-800 to-stone-950',
    mark: 'HIS',
    description:
      'A guided journey through the questions that shaped societies and intellectual traditions.',
  },
};

export function LibraryDetailPage() {
  const { id = '' } = useParams();
  const book = details[id] ?? details['the-living-world'];

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/library" aria-label="Back to library">
            <ArrowLeft />
          </Link>
        </Button>
        <span className="text-muted-foreground text-sm">Back to library</span>
      </div>

      <PreviewNotice>
        This is an example detail record. Metadata, favorites, progress, and the
        linked document will become user-owned data through the library API.
      </PreviewNotice>

      <section className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div>
          <div
            className={`relative mx-auto aspect-[3/4] max-w-72 overflow-hidden rounded-r-2xl rounded-l-md bg-gradient-to-br ${book.cover} p-7 text-white shadow-2xl lg:mx-0`}
          >
            <div className="absolute inset-y-0 left-4 w-px bg-white/15 shadow-[3px_0_6px_rgba(0,0,0,0.25)]" />
            <div className="flex h-full flex-col pl-3">
              <span className="text-xs font-semibold tracking-[0.22em] text-white/50">
                {book.mark}
              </span>
              <strong className="mt-auto font-serif text-3xl leading-tight font-medium">
                {book.title}
              </strong>
              <span className="mt-4 text-xs text-white/55">{book.author}</span>
            </div>
          </div>
        </div>

        <div className="self-center">
          <Badge variant="secondary">{book.category}</Badge>
          <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight sm:text-6xl">
            {book.title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">by {book.author}</p>
          <p className="text-muted-foreground mt-6 max-w-2xl leading-relaxed">
            {book.description}
          </p>

          <div className="mt-7 max-w-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Reading progress</span>
              <span className="text-muted-foreground">{book.progress}%</span>
            </div>
            <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${book.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/documents/learning-and-memory">
                <BookOpen />
                Open reading preview
              </Link>
            </Button>
            <Button
              variant="outline"
              disabled
              title="Favorites arrive with persistence"
            >
              <Heart />
              Add to favorites
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <Clock3 className="text-muted-foreground size-4" />
          <strong className="mt-4 block text-sm">Last opened</strong>
          <p className="text-muted-foreground mt-1 text-xs">
            Today at 10:42 AM
          </p>
        </Card>
        <Card className="p-5">
          <FileText className="text-muted-foreground size-4" />
          <strong className="mt-4 block text-sm">Current page</strong>
          <p className="text-muted-foreground mt-1 text-xs">
            Page 142 of 208
          </p>
        </Card>
        <Card className="p-5">
          <CalendarDays className="text-muted-foreground size-4" />
          <strong className="mt-4 block text-sm">Added</strong>
          <p className="text-muted-foreground mt-1 text-xs">
            September 8, 2026
          </p>
        </Card>
      </section>
    </div>
  );
}
