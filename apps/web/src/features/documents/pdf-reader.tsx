import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Expand,
  LoaderCircle,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react';
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSignedFileUrl } from '@/lib/storage';

import {
  createAnnotation,
  deleteAnnotation,
  getDocument,
  listAnnotations,
  updateDocument,
} from './documents-api';
import { PdfMarkup } from './pdf-markup';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type PdfReaderProps = {
  documentId: string;
  backTo: string;
  backLabel: string;
  headerExtra?: ReactNode;
  onPageChange?: (page: number, pageCount: number) => void;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function highlightText(value: string, term: string) {
  const safe = escapeHtml(value);
  const needle = term.trim();
  if (!needle) return safe;
  const pattern = new RegExp(
    `(${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  );
  return safe.replace(
    pattern,
    '<mark style="background:#fde68a;color:#1c1917;padding:0 1px;border-radius:2px">$1</mark>',
  );
}

export function PdfReader({
  documentId,
  backTo,
  backLabel,
  headerExtra,
  onPageChange,
}: PdfReaderProps) {
  const queryClient = useQueryClient();
  const documentQuery = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => getDocument(documentId),
    enabled: Boolean(documentId),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
  const annotationsQuery = useQuery({
    queryKey: ['annotations', documentId],
    queryFn: () => listAnnotations(documentId),
    enabled: Boolean(documentId),
    refetchOnWindowFocus: false,
  });
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pageOverride, setPage] = useState<number | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState('');
  const [note, setNote] = useState('');
  const rendered = useRef(new Set<number>());
  const onPageChangeRef = useRef(onPageChange);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);
  const pdfRef = useRef<{
    numPages: number;
    getPage: (pageNumber: number) => Promise<{
      getTextContent: () => Promise<{ items: unknown[] }>;
    }>;
  } | null>(null);
  const documentRecord = documentQuery.data;
  const page = pageOverride ?? documentRecord?.lastOpenedPage ?? 1;
  const storagePath = documentRecord?.storagePath;
  if (!revealed && pageCount > 0 && renderedPages >= pageCount) {
    setRevealed(true);
  }

  useEffect(() => {
    if (!storagePath) return;
    let active = true;
    void createSignedFileUrl('documents', storagePath)
      .then((url) => {
        if (active) setFileUrl(url);
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast.error(error instanceof Error ? error.message : 'Unable to open PDF.');
      });
    return () => {
      active = false;
    };
  }, [storagePath]);

  useEffect(() => {
    if (!documentRecord || pageCount === 0 || page === documentRecord.lastOpenedPage) {
      return;
    }
    const timer = window.setTimeout(() => {
      void updateDocument(documentId, { lastOpenedPage: page, pageCount });
      onPageChangeRef.current?.(page, pageCount);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [documentId, documentRecord, page, pageCount]);

  useEffect(() => {
    if (!highlight) return;
    const mark = document.querySelector('.pdf-stage mark');
    mark?.scrollIntoView({ block: 'center', inline: 'nearest' });
  }, [highlight, page, revealed]);

  const noteMutation = useMutation({
    mutationFn: () =>
      createAnnotation(documentId, {
        annotationType: 'note',
        pageNumber: page,
        content: note,
      }),
    onSuccess: async () => {
      setNote('');
      await queryClient.invalidateQueries({ queryKey: ['annotations', documentId] });
    },
  });

  const search = async () => {
    const pdf = pdfRef.current;
    const needle = query.trim().toLowerCase();
    if (!pdf || !needle) return;
    const start =
      highlight.toLowerCase() === needle ? page + 1 : page;
    for (let offset = 0; offset < pdf.numPages; offset += 1) {
      const pageNumber = ((start - 1 + offset) % pdf.numPages) + 1;
      const pdfPage = await pdf.getPage(pageNumber);
      const content = await pdfPage.getTextContent();
      const text = content.items
        .map((item) =>
          typeof item === 'object' && item && 'str' in item
            ? String(item.str)
            : '',
        )
        .join(' ')
        .toLowerCase();
      if (text.includes(needle)) {
        setHighlight(query.trim());
        setPage(pageNumber);
        toast.success(`Found on page ${pageNumber}.`);
        return;
      }
    }
    setHighlight('');
    toast.message('No matches in this PDF.');
  };

  const markRendered = (pageNumber: number) => {
    if (rendered.current.has(pageNumber)) return;
    rendered.current.add(pageNumber);
    setRenderedPages(rendered.current.size);
  };

  if (documentQuery.isLoading) {
    return (
      <div className="text-muted-foreground flex h-[70vh] items-center justify-center gap-2">
        <LoaderCircle className="animate-spin" />
        Opening document…
      </div>
    );
  }

  if (!documentRecord) {
    return (
      <div className="py-20 text-center">
        <Button asChild>
          <Link to={backTo}>Back</Link>
        </Button>
      </div>
    );
  }

  const annotations = annotationsQuery.data ?? [];

  return (
    <div className="-m-5 flex h-[calc(100vh-4.5rem)] min-h-[42rem] flex-col sm:-m-7 lg:-m-10">
      <div className="bg-card flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to={backTo} aria-label={backLabel}>
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="max-w-64 truncate text-sm font-semibold">
          {documentRecord.title}
        </h1>
        <div className="mx-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(Math.max(1, page - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <span className="text-muted-foreground w-20 text-center text-xs">
            {page} / {pageCount || '…'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(Math.min(pageCount || page, page + 1))}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.1).toFixed(2))))}
            aria-label="Zoom out"
          >
            <Minus />
          </Button>
          <span className="text-muted-foreground w-12 text-center text-xs">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(2))))}
            aria-label="Zoom in"
          >
            <Plus />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              void document.querySelector('.pdf-stage')?.requestFullscreen()
            }
            aria-label="Enter fullscreen"
          >
            <Expand />
          </Button>
        </div>
        {headerExtra}
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[8rem_minmax(0,1fr)_18rem]">
        <aside className="bg-card hidden overflow-y-auto border-r p-2 lg:block">
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`mb-2 w-full rounded border p-2 text-xs ${pageNumber === page ? 'bg-secondary' : ''}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ),
          )}
        </aside>
        <main className="pdf-stage bg-muted/40 relative min-h-0 overflow-auto p-6">
          {!revealed && (
            <div className="bg-background absolute inset-0 z-30 flex flex-col items-center justify-center gap-3">
              <LoaderCircle className="animate-spin" />
              <p className="text-sm">
                {pageCount === 0
                  ? 'Opening document…'
                  : `Preparing ${renderedPages} of ${pageCount} pages`}
              </p>
            </div>
          )}
          {fileUrl && (
            <Suspense fallback={null}>
              <Document
                file={fileUrl}
                loading=""
                onLoadSuccess={(pdf) => {
                  pdfRef.current = pdf;
                  setPageCount(pdf.numPages);
                  setPage((current) => Math.min(current ?? page, pdf.numPages));
                }}
              >
                {Array.from({ length: pageCount }, (_, index) => {
                  const pageNumber = index + 1;
                  const visible = pageNumber === page;
                  return (
                    <div
                      key={pageNumber}
                      className={
                        visible
                          ? 'block'
                          : 'pointer-events-none fixed -left-[10000px] top-0'
                      }
                    >
                      {visible && revealed ? (
                        <PdfMarkup
                          documentId={documentId}
                          pageNumber={pageNumber}
                          annotations={annotations}
                        >
                          <Page
                            pageNumber={pageNumber}
                            scale={zoom}
                            className="shadow-xl"
                            loading=""
                            customTextRenderer={({ str }) => highlightText(str, highlight)}
                            onRenderSuccess={() => markRendered(pageNumber)}
                          />
                        </PdfMarkup>
                      ) : (
                        <Page
                          pageNumber={pageNumber}
                          scale={zoom}
                          className="shadow-xl"
                          loading=""
                          customTextRenderer={({ str }) => highlightText(str, highlight)}
                          onRenderSuccess={() => markRendered(pageNumber)}
                        />
                      )}
                    </div>
                  );
                })}
              </Document>
            </Suspense>
          )}
        </main>
        <aside className="bg-card min-h-0 overflow-y-auto border-l p-4">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void search();
            }}
          >
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search PDF"
            />
            <Button type="submit" variant="outline">
              Find
            </Button>
          </form>
          {highlight && (
            <p className="text-muted-foreground mt-2 text-xs">
              Highlighting “{highlight}” on page {page}. Find again to jump to
              the next page.
            </p>
          )}
          <form
            className="mt-4 space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (note.trim()) noteMutation.mutate();
            }}
          >
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note for this page"
              className="border-input min-h-24 w-full rounded-lg border p-3 text-sm"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!note.trim()}>
                Save note
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  createAnnotation(documentId, {
                    annotationType: 'bookmark',
                    pageNumber: page,
                    content: `Page ${page}`,
                  }).then(() =>
                    queryClient.invalidateQueries({
                      queryKey: ['annotations', documentId],
                    }),
                  )
                }
              >
                <Bookmark />
                Bookmark
              </Button>
            </div>
          </form>
          <div className="mt-5 space-y-2">
            {annotations
              .filter((annotation) => annotation.pageNumber === page)
              .map((annotation) => (
                <div key={annotation.id} className="rounded-lg border p-3 text-xs">
                  <div className="mb-1 flex items-center justify-between">
                    <strong className="capitalize">{annotation.annotationType}</strong>
                    <button
                      type="button"
                      aria-label="Delete annotation"
                      onClick={() =>
                        deleteAnnotation(documentId, annotation.id).then(() =>
                          queryClient.invalidateQueries({
                            queryKey: ['annotations', documentId],
                          }),
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <p>{annotation.content}</p>
                </div>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
