import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  Expand,
  Highlighter,
  MessageSquareText,
  Minus,
  PenLine,
  Plus,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const titles: Record<string, string> = {
  'learning-and-memory': 'Learning & Memory',
  'cellular-energy-notes': 'Cellular Energy Notes',
  'modern-europe-reader': 'Modern Europe Reader',
  'calculus-formula-sheet': 'Calculus Formula Sheet',
};

export function DocumentDetailPage() {
  const { id = '' } = useParams();
  const [page, setPage] = useState(12);
  const [zoom, setZoom] = useState(100);
  const title = titles[id] ?? 'Document preview';
  const pageNumbers = [10, 11, 12, 13, 14];

  return (
    <div className="-m-5 flex h-[calc(100vh-4.5rem)] min-h-[42rem] flex-col sm:-m-7 lg:-m-10">
      <div className="bg-card flex flex-wrap items-center gap-2 border-b px-3 py-2 sm:px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/documents" aria-label="Back to documents">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0">
          <h2 className="max-w-44 truncate text-xs font-semibold sm:max-w-72 sm:text-sm">
            {title}
          </h2>
          <p className="text-muted-foreground text-[10px]">
            PDF reader interface preview
          </p>
        </div>

        <div className="mx-auto hidden items-center gap-1 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((value) => Math.max(60, value - 10))}
            aria-label="Zoom out"
          >
            <Minus />
          </Button>
          <span className="text-muted-foreground w-12 text-center text-xs">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((value) => Math.min(160, value + 10))}
            aria-label="Zoom in"
          >
            <Plus />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {[Search, Bookmark, Download, Expand].map((Icon, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              disabled
              title="Available when PDF.js and Storage are connected"
            >
              <Icon />
            </Button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[5rem_minmax(0,1fr)] sm:grid-cols-[8rem_minmax(0,1fr)] lg:grid-cols-[10rem_minmax(0,1fr)_15rem]">
        <aside className="bg-card min-h-0 overflow-y-auto border-r p-2 sm:p-3">
          <p className="text-muted-foreground mb-3 hidden text-[10px] font-semibold tracking-wider uppercase sm:block">
            Pages
          </p>
          <div className="space-y-3">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={cn(
                  'w-full rounded-md border p-1 transition-colors',
                  page === pageNumber
                    ? 'border-primary bg-secondary'
                    : 'hover:bg-muted',
                )}
                onClick={() => setPage(pageNumber)}
              >
                <div className="bg-background aspect-[3/4] rounded-sm p-1.5 shadow-sm">
                  <div className="bg-muted h-1 w-2/3 rounded" />
                  <div className="mt-2 space-y-1">
                    <div className="bg-muted h-0.5 rounded" />
                    <div className="bg-muted h-0.5 rounded" />
                    <div className="bg-muted h-0.5 w-4/5 rounded" />
                  </div>
                </div>
                <span className="text-muted-foreground mt-1 block text-[9px]">
                  {pageNumber}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="bg-muted/45 relative min-h-0 overflow-auto p-4 sm:p-8">
          <div
            className="bg-card mx-auto min-h-[42rem] w-full max-w-[38rem] origin-top p-8 shadow-xl transition-transform sm:p-12"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <div className="text-muted-foreground flex items-center justify-between text-[10px] tracking-widest uppercase">
              <span>Chapter III</span>
              <span>Page {page}</span>
            </div>
            <h1 className="mt-8 font-serif text-3xl font-medium sm:text-4xl">
              How knowledge takes root
            </h1>
            <p className="text-muted-foreground mt-3 font-serif italic">
              Learning, memory, and the practice of retrieval
            </p>
            <div className="mt-8 space-y-5 font-serif leading-8 text-foreground/80">
              <p>
                Active recall strengthens the pathways that make new
                information easier to retrieve. Each attempt to remember is
                part of the learning process itself.
              </p>
              <p>
                Spacing those attempts over time allows knowledge to become
                more durable, flexible, and connected to what we already know.
              </p>
              <p className="bg-amber-200/55 px-1 dark:bg-amber-700/35">
                Meaningful connections turn isolated facts into lasting
                knowledge.
              </p>
              <p>
                Reflection gives those connections language. Explaining an idea
                in our own words reveals both what we understand and what still
                needs attention.
              </p>
            </div>
            <div className="mt-10 border-l-2 border-rose-400 bg-rose-50 p-4 text-sm text-rose-900 dark:bg-rose-950 dark:text-rose-100">
              <MessageSquareText className="mb-2 size-4" />
              Example annotation: connect this passage to the lecture on
              retrieval practice.
            </div>
          </div>

          <Card className="fixed right-5 bottom-5 left-auto z-20 flex items-center gap-1 p-1.5 shadow-lg lg:right-[17rem]">
            <Button
              variant="ghost"
              size="icon"
              disabled
              title="Highlights arrive with PDF annotations"
            >
              <Highlighter />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled
              title="Drawing arrives with PDF annotations"
            >
              <PenLine />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled
              title="Notes arrive with PDF annotations"
            >
              <MessageSquareText />
            </Button>
          </Card>
        </main>

        <aside className="bg-card hidden min-h-0 border-l p-4 lg:block">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Notes</h3>
            <Badge variant="outline">1 example</Badge>
          </div>
          <Card className="mt-4 p-4 shadow-none">
            <p className="text-xs leading-relaxed">
              Connect this passage to the lecture on retrieval practice.
            </p>
            <span className="text-muted-foreground mt-3 block text-[10px]">
              Page {page} · Example note
            </span>
          </Card>
          <p className="text-muted-foreground mt-5 text-[11px] leading-relaxed">
            Annotation persistence will be connected to the
            <code className="mx-1 rounded bg-muted px-1 py-0.5">
              document_annotations
            </code>
            table.
          </p>
        </aside>
      </div>

      <div className="bg-card flex items-center justify-center gap-3 border-t py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          aria-label="Previous preview page"
        >
          <ChevronLeft />
        </Button>
        <span className="text-muted-foreground text-xs">
          Page {page} of 36
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPage((value) => Math.min(36, value + 1))}
          aria-label="Next preview page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
