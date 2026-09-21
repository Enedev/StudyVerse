import { useQuery } from '@tanstack/react-query';
import { Excalidraw } from '@excalidraw/excalidraw';
import { ArrowLeft, LoaderCircle, PenLine, Plus, Type } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import '@excalidraw/excalidraw/index.css';

import { getNotebook, updateNotebook } from './notebooks-api';
import type { NotebookDetail, NotebookPage, PaperType } from './notebook-types';

const paperClass: Record<PaperType, string> = {
  blank: 'bg-[#fffdf8]',
  lined:
    'bg-[#fffdf8] bg-[linear-gradient(transparent_31px,#e7e5e4_32px)] bg-[length:100%_32px]',
  grid: 'bg-[#fffdf8] bg-[linear-gradient(#e7e5e4_1px,transparent_1px),linear-gradient(90deg,#e7e5e4_1px,transparent_1px)] bg-[size:24px_24px]',
  dotted:
    'bg-[#fffdf8] bg-[radial-gradient(#d6d3d1_1.2px,transparent_1.2px)] bg-[size:22px_22px]',
};

function NotebookStudio({ notebook }: { notebook: NotebookDetail }) {
  const [title, setTitle] = useState(notebook.title);
  const [paperType, setPaperType] = useState<PaperType>(notebook.paperType);
  const [pages, setPages] = useState<NotebookPage[]>(notebook.pages);
  const [activeId, setActiveId] = useState(notebook.pages[0]?.id ?? '');
  const [saveState, setSaveState] = useState('Saved');
  const activePage = pages.find((page) => page.id === activeId) ?? pages[0];
  const sceneSignature = useRef('');
  const initialScene = useMemo(
    () =>
      activePage?.scene ?? {
        elements: [],
        appState: { viewBackgroundColor: '#fffdf8' },
      },
    [activePage?.id],
  );

  useEffect(() => {
    sceneSignature.current = '';
  }, [activePage?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSaveState('Saving');
      void updateNotebook(notebook.id, { title, paperType, pages })
        .then(() => setSaveState('Saved'))
        .catch((error: unknown) => {
          setSaveState('Unsaved');
          toast.error(error instanceof Error ? error.message : 'Unable to save the notebook.');
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
    const page: NotebookPage = {
      id: crypto.randomUUID(),
      mode: 'write',
      text: '',
      scene: null,
    };
    setPages((current) => [...current, page]);
    setActiveId(page.id);
  };

  return (
    <div className="-m-5 flex h-[calc(100vh-4.5rem)] min-h-[42rem] flex-col sm:-m-7 lg:-m-10">
      <div className="bg-card flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/notebooks" aria-label="Back to notebooks"><ArrowLeft /></Link>
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
              <span className="text-muted-foreground mt-1 block text-xs capitalize">{page.mode}</span>
            </button>
          ))}
          <Button variant="outline" className="w-full" onClick={addPage}>
            <Plus />
            Add page
          </Button>
        </aside>
        <section className="min-h-0 overflow-hidden p-4">
          {activePage && (
            <div className="mb-3 flex gap-2">
              <Button
                size="sm"
                variant={activePage.mode === 'write' ? 'default' : 'outline'}
                onClick={() => updateActive({ mode: 'write' })}
              >
                <Type />
                Write
              </Button>
              <Button
                size="sm"
                variant={activePage.mode === 'draw' ? 'default' : 'outline'}
                onClick={() => updateActive({ mode: 'draw' })}
              >
                <PenLine />
                Draw
              </Button>
            </div>
          )}
          {activePage?.mode === 'write' ? (
            <textarea
              value={activePage.text}
              onChange={(event) => updateActive({ text: event.target.value })}
              placeholder="Start writing…"
              className={cn(
                'h-[calc(100%-3rem)] w-full resize-none rounded-xl border p-8 text-base leading-8 shadow-sm outline-none',
                paperClass[paperType],
              )}
            />
          ) : activePage ? (
            <div className="relative h-[calc(100%-3rem)] overflow-hidden rounded-xl border bg-[#fffdf8]">
              <Excalidraw
                key={activePage.id}
                initialData={initialScene as ComponentProps<typeof Excalidraw>['initialData']}
                UIOptions={{
                  canvasActions: {
                    export: false,
                    loadScene: false,
                    saveAsImage: false,
                    saveToActiveFile: false,
                  },
                }}
                onChange={(elements, _appState, files) => {
                  const next = elements
                    .map((element) => `${element.id}:${element.version}`)
                    .join('|');
                  if (next === sceneSignature.current) return;
                  sceneSignature.current = next;
                  updateActive({ scene: { elements, files } });
                }}
              />
              {paperType !== 'blank' && (
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0',
                    paperType === 'lined' &&
                      'bg-[linear-gradient(transparent_31px,rgba(180,160,130,0.55)_32px)] bg-[length:100%_32px]',
                    paperType === 'grid' &&
                      'bg-[linear-gradient(rgba(180,160,130,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(180,160,130,0.35)_1px,transparent_1px)] bg-[size:24px_24px]',
                    paperType === 'dotted' &&
                      'bg-[radial-gradient(rgba(180,160,130,0.7)_1.1px,transparent_1.2px)] bg-[size:22px_22px]',
                  )}
                />
              )}
            </div>
          ) : null}
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
        <Button className="mt-5" asChild><Link to="/notebooks">Back to notebooks</Link></Button>
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
