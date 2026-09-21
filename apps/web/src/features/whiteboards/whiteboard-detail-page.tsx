import {
  ArrowLeft,
  Hand,
  Image,
  Maximize,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Redo2,
  Share2,
  Square,
  StickyNote,
  Type,
  Undo2,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const titles: Record<string, string> = {
  'cell-biology-map': 'Cell biology concept map',
  'research-plan': 'Research presentation plan',
  'calculus-review': 'Calculus review',
};

const tools = [
  { label: 'Select', icon: MousePointer2 },
  { label: 'Hand', icon: Hand },
  { label: 'Draw', icon: Pencil },
  { label: 'Shape', icon: Square },
  { label: 'Text', icon: Type },
  { label: 'Sticky note', icon: StickyNote },
  { label: 'Image', icon: Image },
];

export function WhiteboardDetailPage() {
  const { id = '' } = useParams();
  const [zoom, setZoom] = useState(100);
  const title = titles[id] ?? 'Whiteboard preview';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/whiteboards" aria-label="Back to whiteboards">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          <p className="text-muted-foreground text-xs">
            Example board · Editing not connected
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          tldraw preview
        </Badge>
        <Button
          variant="outline"
          disabled
          title="Sharing arrives with whiteboard persistence"
        >
          <Share2 />
          Share
        </Button>
      </div>

      <Card className="relative h-[calc(100vh-11rem)] min-h-[34rem] overflow-hidden bg-[#f7f4eb] dark:bg-[#141c26]">
        <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(#718096_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

        <div className="absolute top-4 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-xl border bg-card/90 p-1.5 shadow-lg backdrop-blur">
          {tools.map(({ label, icon: Icon }, index) => (
            <button
              key={label}
              type="button"
              disabled
              title={`${label} will be powered by tldraw`}
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                index === 0
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
              aria-label={label}
            >
              <Icon className="size-4" />
            </button>
          ))}
          <span className="bg-border mx-1 w-px shrink-0" />
          <button
            type="button"
            disabled
            className="text-muted-foreground flex size-9 shrink-0 items-center justify-center"
            aria-label="Undo"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            disabled
            className="text-muted-foreground flex size-9 shrink-0 items-center justify-center"
            aria-label="Redo"
          >
            <Redo2 className="size-4" />
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div
            className="relative h-[30rem] w-[48rem] shrink-0 transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <div className="absolute top-[12%] left-[33%] rounded-full border-2 border-amber-500 bg-amber-50 px-6 py-3 font-serif text-lg font-medium text-amber-900 shadow-md dark:bg-amber-950 dark:text-amber-100">
              How does a cell make energy?
            </div>
            <div className="bg-foreground/25 absolute top-[37%] left-[42%] h-px w-44 rotate-[32deg]" />
            <div className="bg-foreground/25 absolute top-[39%] left-[31%] h-px w-40 rotate-[145deg]" />
            <div className="absolute top-[52%] left-[14%] rounded-full border-2 border-emerald-500 bg-emerald-50 px-5 py-2.5 font-medium text-emerald-900 shadow dark:bg-emerald-950 dark:text-emerald-100">
              Glycolysis
            </div>
            <div className="absolute top-[58%] right-[13%] rounded-full border-2 border-sky-500 bg-sky-50 px-5 py-2.5 font-medium text-sky-900 shadow dark:bg-sky-950 dark:text-sky-100">
              Mitochondria
            </div>
            <div className="absolute right-[31%] bottom-[5%] w-44 rotate-2 bg-yellow-200 p-5 text-sm text-yellow-950 shadow-lg">
              <StickyNote className="mb-3 size-5" />
              ATP stores usable energy for the cell.
            </div>
            <div className="absolute top-[42%] right-[26%] text-violet-600">
              <MousePointer2 className="size-5 fill-current" />
              <span className="ml-4 rounded bg-violet-600 px-2 py-1 text-[10px] text-white">
                Maya
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-xl border bg-card/90 p-1.5 shadow-lg backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((value) => Math.max(60, value - 10))}
            aria-label="Zoom out"
          >
            <Minus />
          </Button>
          <span className="text-muted-foreground w-12 text-center text-xs font-semibold">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(100)}
            aria-label="Reset zoom"
          >
            <Maximize />
          </Button>
        </div>

        <div className="absolute right-4 bottom-4 max-w-xs rounded-lg border bg-card/90 px-3 py-2 text-[11px] shadow backdrop-blur">
          <strong>Canvas preview</strong>
          <span className="text-muted-foreground ml-1">
            tldraw editing, realtime cursors, and persistence come next.
          </span>
        </div>
      </Card>
    </div>
  );
}
