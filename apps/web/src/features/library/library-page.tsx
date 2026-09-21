import {
  BookOpen,
  Grid2X2,
  Heart,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/workspace/page-header';
import { PreviewNotice } from '@/components/workspace/preview-notice';
import { cn } from '@/lib/utils';

const books = [
  {
    id: 'the-living-world',
    title: 'The Living World',
    author: 'Elena Marín',
    category: 'Biology',
    progress: 68,
    cover: 'from-emerald-700 via-teal-700 to-slate-900',
    mark: 'BIO',
  },
  {
    id: 'ways-of-knowing',
    title: 'Ways of Knowing',
    author: 'Thomas Bell',
    category: 'Philosophy',
    progress: 34,
    cover: 'from-indigo-700 via-violet-700 to-slate-900',
    mark: 'PHI',
  },
  {
    id: 'visual-thinking',
    title: 'Visual Thinking',
    author: 'Mira Chen',
    category: 'Design',
    progress: 12,
    cover: 'from-amber-600 via-orange-700 to-stone-900',
    mark: 'VIS',
  },
  {
    id: 'a-brief-history',
    title: 'A Brief History of Ideas',
    author: 'Jonas Reed',
    category: 'History',
    progress: 81,
    cover: 'from-rose-700 via-red-800 to-stone-950',
    mark: 'HIS',
  },
];

const categories = ['All', 'Biology', 'Philosophy', 'Design', 'History'];

export function LibraryPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter(
      (book) =>
        (category === 'All' || book.category === category) &&
        (!query ||
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)),
    );
  }, [category, search]);

  return (
    <div className="space-y-7">
      <PageHeader
        icon={BookOpen}
        eyebrow="Your knowledge, collected"
        title="Library"
        description="Keep books and long-form readings together, remember where you stopped, and return to what matters."
        action={
          <Button disabled title="Uploads arrive with Storage integration">
            <Plus />
            Add book
          </Button>
        }
      />

      <PreviewNotice>
        This collection uses example metadata to demonstrate search, categories,
        reading progress, and detail pages. Uploads will use private Supabase
        Storage.
      </PreviewNotice>

      <Card className="bg-primary text-primary-foreground relative overflow-hidden border-0 p-6 sm:p-8">
        <div className="absolute -top-20 -right-8 size-56 rounded-full border border-white/10" />
        <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
              Continue reading
            </p>
            <h3 className="mt-3 font-serif text-3xl font-medium">
              The Living World
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Chapter 8 · Cellular energy
            </p>
            <div className="mt-5 h-1.5 max-w-md overflow-hidden rounded-full bg-white/15">
              <div className="bg-accent h-full w-[68%] rounded-full" />
            </div>
            <p className="mt-2 text-[11px] text-white/50">68% complete</p>
          </div>
          <Button
            className="bg-white text-slate-900 hover:bg-white/90"
            asChild
          >
            <Link to="/library/the-living-world">Open book</Link>
          </Button>
        </div>
      </Card>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                category === item
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1 sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="h-9 pl-9"
              placeholder="Search preview library"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" disabled>
            <SlidersHorizontal />
          </Button>
          <Button variant="outline" size="icon" aria-label="Grid view">
            <Grid2X2 />
          </Button>
          <Button variant="ghost" size="icon" disabled aria-label="List view">
            <List />
          </Button>
        </div>
      </div>

      {filteredBooks.length > 0 ? (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <Link
              key={book.id}
              to={`/library/${book.id}`}
              className="group min-w-0"
            >
              <div
                className={`relative aspect-[3/4] overflow-hidden rounded-r-xl rounded-l-md bg-gradient-to-br ${book.cover} p-5 text-white shadow-lg transition-all group-hover:-translate-y-1 group-hover:shadow-xl`}
              >
                <div className="absolute inset-y-0 left-3 w-px bg-white/15 shadow-[2px_0_4px_rgba(0,0,0,0.2)]" />
                <div className="flex h-full flex-col pl-2">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-white/50">
                    {book.mark}
                  </span>
                  <strong className="mt-auto font-serif text-xl leading-tight font-medium sm:text-2xl">
                    {book.title}
                  </strong>
                  <span className="mt-3 text-[10px] text-white/55">
                    {book.author}
                  </span>
                </div>
                <span className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/15 text-white/75 backdrop-blur">
                  <Heart className="size-3.5" />
                </span>
              </div>
              <div className="px-1 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground truncate text-xs">
                    {book.category}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {book.progress}%
                  </span>
                </div>
                <div className="bg-muted mt-2 h-1 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <Card className="p-12 text-center">
          <Search className="text-muted-foreground mx-auto size-6" />
          <h3 className="mt-4 text-sm font-semibold">No books found</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Try another category or search term.
          </p>
        </Card>
      )}
    </div>
  );
}
