import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Eraser,
  Highlighter,
  ImagePlus,
  LoaderCircle,
  PenLine,
  Plus,
  Type,
} from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { getNotebook, updateNotebook } from './notebooks-api';
import {
  normalizePage,
  type NotebookDetail,
  type NotebookImage,
  type NotebookPage,
  type NotebookPoint,
  type NotebookStroke,
  type PaperType,
} from './notebook-types';

type Tool = 'text' | 'pen' | 'highlight' | 'eraser';

const paperClass: Record<PaperType, string> = {
  blank: 'bg-[#fffdf8]',
  lined:
    'bg-[#fffdf8] [background-image:linear-gradient(transparent_31px,#e7e5e4_32px)] [background-size:100%_32px]',
  grid: 'bg-[#fffdf8] [background-image:linear-gradient(#e7e5e4_1px,transparent_1px),linear-gradient(90deg,#e7e5e4_1px,transparent_1px)] [background-size:24px_24px]',
  dotted:
    'bg-[#fffdf8] [background-image:radial-gradient(#d6d3d1_1.2px,transparent_1.2px)] [background-size:22px_22px]',
};

function locate(event: PointerEvent<SVGSVGElement>) {
  const rect = event.currentTarget?.getBoundingClientRect();
  if (!rect || rect.width === 0 || rect.height === 0) return null;
  return {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
}

async function readNotebookImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to read that image.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.84);
}

function NotebookStudio({ notebook }: { notebook: NotebookDetail }) {
  const [title, setTitle] = useState(notebook.title);
  const [paperType, setPaperType] = useState<PaperType>(notebook.paperType);
  const [pages, setPages] = useState<NotebookPage[]>(notebook.pages.map(normalizePage));
  const [activeId, setActiveId] = useState(notebook.pages[0]?.id ?? '');
  const [tool, setTool] = useState<Tool>('text');
  const [draft, setDraft] = useState<NotebookPoint[]>([]);
  const [saveState, setSaveState] = useState('Saved');
  const imageInput = useRef<HTMLInputElement>(null);
  const dragImage = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const activePage = pages.find((page) => page.id === activeId) ?? pages[0];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSaveState('Saving');
      void updateNotebook(notebook.id, { title, paperType, pages })
        .then(() => setSaveState('Saved'))
        .catch((error: unknown) => {
          setSaveState('Unsaved');
          toast.error(
            error instanceof Error ? error.message : 'Unable to save the notebook.',
          );
        });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [notebook.id, pages, paperType, title]);

  const updateActive = (patch: Partial<NotebookPage>) => {
    setPages((current) =>
      current.map((page) => (page.id === activePage?.id ? { ...page, ...patch } : page)),
    );
  };

  const addPage = () => {
    const page = normalizePage({});
    setPages((current) => [...current, page]);
    setActiveId(page.id);
  };

  const finishStroke = (points: NotebookPoint[]) => {
    if (!activePage || points.length < 2 || (tool !== 'pen' && tool !== 'highlight')) {
      setDraft([]);
      return;
    }
    const stroke: NotebookStroke = {
      id: crypto.randomUUID(),
      tool,
      points,
    };
    updateActive({ strokes: [...activePage.strokes, stroke] });
    setDraft([]);
  };

  const addImage = async (file: File | undefined) => {
    if (!file || !activePage) return;
    try {
      const src = await readNotebookImage(file);
      const image: NotebookImage = {
        id: crypto.randomUUID(),
        src,
        x: 0.18,
        y: 0.18,
        width: 0.42,
      };
      updateActive({ images: [...activePage.images, image] });
      setTool('text');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add that image.');
    }
  };

  return (
    <div className="-m-5 flex h-[calc(100vh-4.5rem)] min-h-[42rem] flex-col sm:-m-7 lg:-m-10">
      <div className="bg-card flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/notebooks" aria-label="Back to notebooks">
            <ArrowLeft />
          </Link>
        </Button>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
        />
        <select
          className="border-input bg-background h-9 rounded-lg border px-2 text-xs"
          value={paperType}
          onChange={(event) => setPaperType(event.target.value as PaperType)}
        >
          <option value="blank">Blank</option>
          <option value="lined">Lined</option>
          <option value="grid">Grid</option>
          <option value="dotted">Dotted</option>
        </select>
        <p className="text-muted-foreground text-xs">{saveState}</p>
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <aside className="bg-card space-y-2 overflow-y-auto border-r p-3">
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              className={cn(
                'w-full rounded-lg border p-3 text-left text-sm',
                page.id === activePage?.id && 'bg-secondary',
              )}
              onClick={() => setActiveId(page.id)}
            >
              Page {index + 1}
            </button>
          ))}
          <Button variant="outline" className="w-full" onClick={addPage}>
            <Plus />
            Add page
          </Button>
        </aside>
        <section className="flex min-h-0 flex-col overflow-hidden p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {(
              [
                ['text', Type, 'Write'],
                ['pen', PenLine, 'Draw'],
                ['highlight', Highlighter, 'Highlight'],
                ['eraser', Eraser, 'Eraser'],
              ] as const
            ).map(([value, Icon, label]) => (
              <Button
                key={value}
                size="sm"
                variant={tool === value ? 'default' : 'outline'}
                onClick={() => setTool(value)}
              >
                <Icon />
                {label}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={() => imageInput.current?.click()}>
              <ImagePlus />
              Image
            </Button>
            <input
              ref={imageInput}
              className="hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                void addImage(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>
          {activePage && (
            <div className={cn('relative min-h-0 flex-1 overflow-hidden rounded-xl border shadow-sm', paperClass[paperType])}>
              <textarea
                value={activePage.text}
                onChange={(event) => updateActive({ text: event.target.value })}
                placeholder={tool === 'text' ? 'Write on this page…' : ''}
                readOnly={tool !== 'text'}
                className={cn(
                  'absolute inset-0 z-0 h-full w-full resize-none bg-transparent p-8 text-base leading-8 outline-none',
                  tool === 'text' ? 'cursor-text' : 'pointer-events-none',
                )}
              />
              {activePage.images.map((image) => (
                <img
                  key={image.id}
                  src={image.src}
                  alt=""
                  draggable={false}
                  className={cn(
                    'absolute z-30 rounded shadow',
                    tool === 'eraser' ? 'cursor-pointer' : 'cursor-move',
                  )}
                  style={{
                    left: `${image.x * 100}%`,
                    top: `${image.y * 100}%`,
                    width: `${image.width * 100}%`,
                  }}
                  onPointerDown={(event) => {
                    if (tool === 'eraser') {
                      updateActive({
                        images: activePage.images.filter((item) => item.id !== image.id),
                      });
                      return;
                    }
                    if (tool !== 'text') return;
                    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
                    if (!rect) return;
                    dragImage.current = {
                      id: image.id,
                      dx: (event.clientX - rect.left) / rect.width - image.x,
                      dy: (event.clientY - rect.top) / rect.height - image.y,
                    };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    const drag = dragImage.current;
                    if (!drag || drag.id !== image.id) return;
                    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
                    if (!rect) return;
                    const x = Math.min(0.85, Math.max(0, (event.clientX - rect.left) / rect.width - drag.dx));
                    const y = Math.min(0.85, Math.max(0, (event.clientY - rect.top) / rect.height - drag.dy));
                    updateActive({
                      images: activePage.images.map((item) =>
                        item.id === image.id ? { ...item, x, y } : item,
                      ),
                    });
                  }}
                  onPointerUp={() => {
                    dragImage.current = null;
                  }}
                />
              ))}
              <svg
                className={cn(
                  'absolute inset-0 z-20 h-full w-full',
                  tool === 'pen' || tool === 'highlight' || tool === 'eraser'
                    ? 'cursor-crosshair'
                    : 'pointer-events-none',
                )}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                onPointerDown={(event) => {
                  if (tool !== 'pen' && tool !== 'highlight') return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  const point = locate(event);
                  if (point) setDraft([point]);
                }}
                onPointerMove={(event) => {
                  if (event.buttons === 0) return;
                  const point = locate(event);
                  if (!point) return;
                  setDraft((current) => (current.length === 0 ? current : [...current, point]));
                }}
                onPointerUp={(event) => {
                  const point = locate(event);
                  finishStroke(point ? [...draft, point] : draft);
                }}
              >
                {activePage.strokes.map((stroke) => (
                  <polyline
                    key={stroke.id}
                    points={stroke.points.map((point) => `${point.x * 100},${point.y * 100}`).join(' ')}
                    fill="none"
                    stroke={stroke.tool === 'highlight' ? '#f5d90a' : '#1c1917'}
                    strokeWidth={stroke.tool === 'highlight' ? 3.2 : 0.7}
                    strokeOpacity={stroke.tool === 'highlight' ? 0.45 : 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={tool === 'eraser' ? 'pointer-events-auto cursor-pointer' : undefined}
                    onPointerDown={(event) => {
                      if (tool !== 'eraser') return;
                      event.stopPropagation();
                      updateActive({
                        strokes: activePage.strokes.filter((item) => item.id !== stroke.id),
                      });
                    }}
                  />
                ))}
                {draft.length > 1 && (
                  <polyline
                    points={draft.map((point) => `${point.x * 100},${point.y * 100}`).join(' ')}
                    fill="none"
                    stroke={tool === 'highlight' ? '#f5d90a' : '#1c1917'}
                    strokeWidth={tool === 'highlight' ? 3.2 : 0.7}
                    strokeOpacity={tool === 'highlight' ? 0.45 : 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function NotebookDetailPage() {
  const { id = '' } = useParams();
  const notebookQuery = useQuery({
    queryKey: ['notebook', id],
    queryFn: () => getNotebook(id),
    enabled: Boolean(id),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  if (notebookQuery.isError) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-3xl">This notebook is unavailable</h1>
        <Button className="mt-5" asChild>
          <Link to="/notebooks">Back to notebooks</Link>
        </Button>
      </div>
    );
  }

  if (!notebookQuery.isFetchedAfterMount || !notebookQuery.data) {
    return (
      <div className="text-muted-foreground flex h-[70vh] items-center justify-center gap-2">
        <LoaderCircle className="animate-spin" />
        Opening notebook…
      </div>
    );
  }

  return <NotebookStudio key={notebookQuery.data.id} notebook={notebookQuery.data} />;
}
