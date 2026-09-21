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
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export function DocumentDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const documentQuery = useQuery({
    queryKey: ['document', id],
    queryFn: () => getDocument(id),
    enabled: Boolean(id),
  });
  const annotationsQuery = useQuery({
    queryKey: ['annotations', id],
    queryFn: () => listAnnotations(id),
    enabled: Boolean(id),
  });
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pageOverride, setPage] = useState<number | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const pdfRef = useRef<{
    numPages: number;
    getPage: (pageNumber: number) => Promise<{
      getTextContent: () => Promise<{ items: unknown[] }>;
    }>;
  } | null>(null);
  const documentRecord = documentQuery.data;
  const page = pageOverride ?? documentRecord?.lastOpenedPage ?? 1;

  useEffect(() => {
    if (!documentRecord) return;
    let active = true;
    void createSignedFileUrl('documents', documentRecord.storagePath)
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
  }, [documentRecord]);

  useEffect(() => {
    if (!documentRecord || page === documentRecord.lastOpenedPage) return;
    const timer = window.setTimeout(() => {
      void updateDocument(id, { lastOpenedPage: page, pageCount });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [documentRecord, id, page, pageCount]);

  const noteMutation = useMutation({
    mutationFn: () =>
      createAnnotation(id, { annotationType: 'note', pageNumber: page, content: note }),
    onSuccess: async () => {
      setNote('');
      await queryClient.invalidateQueries({ queryKey: ['annotations', id] });
    },
  });

  const search = async () => {
    const pdf = pdfRef.current;
    const needle = query.trim().toLowerCase();
    if (!pdf || !needle) return;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
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
        setPage(pageNumber);
        return;
      }
    }
    toast.message('No matches in this PDF.');
  };

  if (documentQuery.isLoading || !fileUrl) {
    return <div className="text-muted-foreground flex h-[70vh] items-center justify-center gap-2"><LoaderCircle className="animate-spin" />Opening document…</div>;
  }

  if (!documentRecord) {
    return <div className="py-20 text-center"><Button asChild><Link to="/documents">Back to documents</Link></Button></div>;
  }

  const annotations = annotationsQuery.data ?? [];

  return (
    <div className="-m-5 flex h-[calc(100vh-4.5rem)] min-h-[42rem] flex-col sm:-m-7 lg:-m-10">
      <div className="bg-card flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/documents" aria-label="Back to documents"><ArrowLeft /></Link>
        </Button>
        <h1 className="max-w-64 truncate text-sm font-semibold">{documentRecord.title}</h1>
        <div className="mx-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setPage(Math.max(1, page - 1))} aria-label="Previous page"><ChevronLeft /></Button>
          <span className="text-muted-foreground w-20 text-center text-xs">{page} / {pageCount}</span>
          <Button variant="ghost" size="icon" onClick={() => setPage(Math.min(pageCount, page + 1))} aria-label="Next page"><ChevronRight /></Button>
          <Button variant="ghost" size="icon" onClick={() => setZoom((value) => Math.max(0.6, value - 0.1))} aria-label="Zoom out"><Minus /></Button>
          <span className="text-muted-foreground w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom((value) => Math.min(2, value + 0.1))} aria-label="Zoom in"><Plus /></Button>
          <Button variant="ghost" size="icon" onClick={() => void document.querySelector('.pdf-stage')?.requestFullscreen()} aria-label="Enter fullscreen"><Expand /></Button>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[8rem_minmax(0,1fr)_18rem]">
        <aside className="bg-card hidden overflow-y-auto border-r p-2 lg:block">
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <button key={pageNumber} type="button" className={`mb-2 w-full rounded border p-2 text-xs ${pageNumber === page ? 'bg-secondary' : ''}`} onClick={() => setPage(pageNumber)}>
              {pageNumber}
            </button>
          ))}
        </aside>
        <main className="pdf-stage bg-muted/40 min-h-0 overflow-auto p-6">
          <Document
            file={fileUrl}
            loading={<LoaderCircle className="animate-spin" />}
            onLoadSuccess={(pdf) => {
              pdfRef.current = pdf;
              setPageCount(pdf.numPages);
              setPage(Math.min(page, pdf.numPages));
            }}
          >
            <Page pageNumber={page} scale={zoom} className="mx-auto shadow-xl" />
          </Document>
        </main>
        <aside className="bg-card min-h-0 overflow-y-auto border-l p-4">
          <div className="flex gap-2">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search PDF" />
            <Button variant="outline" onClick={() => void search()}>
              Find
            </Button>
          </div>
          <form className="mt-4 space-y-2" onSubmit={(event) => {
            event.preventDefault();
            if (note.trim()) noteMutation.mutate();
          }}>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note for this page" className="border-input min-h-24 w-full rounded-lg border p-3 text-sm" />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!note.trim()}>Save note</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => createAnnotation(id, { annotationType: 'bookmark', pageNumber: page, content: `Page ${page}` }).then(() => queryClient.invalidateQueries({ queryKey: ['annotations', id] }))}>
                <Bookmark />Bookmark
              </Button>
            </div>
          </form>
          <div className="mt-5 space-y-2">
            {annotations.filter((annotation) => annotation.pageNumber === page).map((annotation) => (
              <div key={annotation.id} className="rounded-lg border p-3 text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <strong className="capitalize">{annotation.annotationType}</strong>
                  <button type="button" aria-label="Delete annotation" onClick={() => deleteAnnotation(id, annotation.id).then(() => queryClient.invalidateQueries({ queryKey: ['annotations', id] }))}>
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
