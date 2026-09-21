import {
  Clock3,
  FileText,
  FolderOpen,
  MoreHorizontal,
  Search,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/workspace/page-header';
import { PreviewNotice } from '@/components/workspace/preview-notice';

const documents = [
  {
    id: 'learning-and-memory',
    title: 'Learning & Memory',
    filename: 'learning-and-memory.pdf',
    subject: 'Psychology',
    pages: 36,
    progress: 33,
    opened: '8 minutes ago',
    tone: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  },
  {
    id: 'cellular-energy-notes',
    title: 'Cellular Energy Notes',
    filename: 'cellular-energy.pdf',
    subject: 'Biology',
    pages: 24,
    progress: 75,
    opened: 'Yesterday',
    tone:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    id: 'modern-europe-reader',
    title: 'Modern Europe Reader',
    filename: 'modern-europe-reader.pdf',
    subject: 'History',
    pages: 112,
    progress: 18,
    opened: 'Sep 17',
    tone: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    id: 'calculus-formula-sheet',
    title: 'Calculus Formula Sheet',
    filename: 'calculus-formulas.pdf',
    subject: 'Mathematics',
    pages: 8,
    progress: 100,
    opened: 'Sep 12',
    tone: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  },
];

export function DocumentsPage() {
  const [search, setSearch] = useState('');

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents.filter(
      (document) =>
        !query ||
        document.title.toLowerCase().includes(query) ||
        document.subject.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <div className="space-y-7">
      <PageHeader
        icon={FileText}
        eyebrow="Read with purpose"
        title="Documents"
        description="A focused place for PDFs, course readings, annotations, and the ideas you want to revisit."
        action={
          <Button disabled title="Uploads arrive with private Storage">
            <Upload />
            Upload PDF
          </Button>
        }
      />

      <PreviewNotice>
        These example documents demonstrate the library and reader flow. Real
        files will upload to a private Supabase Storage bucket and render with
        PDF.js.
      </PreviewNotice>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <FolderOpen className="text-muted-foreground size-4" />
          <strong className="mt-3 block font-serif text-3xl font-medium">
            4
          </strong>
          <p className="text-muted-foreground mt-1 text-xs">
            Example documents
          </p>
        </Card>
        <Card className="p-5">
          <FileText className="text-muted-foreground size-4" />
          <strong className="mt-3 block font-serif text-3xl font-medium">
            180
          </strong>
          <p className="text-muted-foreground mt-1 text-xs">Pages collected</p>
        </Card>
        <Card className="p-5">
          <Clock3 className="text-muted-foreground size-4" />
          <strong className="mt-3 block font-serif text-3xl font-medium">
            8m
          </strong>
          <p className="text-muted-foreground mt-1 text-xs">
            Since last reading
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">All documents</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Example files for the reader experience
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="h-9 pl-9"
              placeholder="Search preview documents"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="divide-y">
          {filteredDocuments.map((document) => (
            <Link
              key={document.id}
              to={`/documents/${document.id}`}
              className="hover:bg-muted/30 grid gap-4 p-4 transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5"
            >
              <div
                className={`flex size-12 items-center justify-center rounded-xl ${document.tone}`}
              >
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="truncate text-sm font-semibold">
                    {document.title}
                  </h4>
                  <Badge variant="outline" className="text-[10px]">
                    PDF
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span>{document.subject}</span>
                  <span>{document.pages} pages</span>
                  <span>Opened {document.opened}</span>
                </div>
                <div className="bg-muted mt-3 h-1 max-w-md overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${document.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-muted-foreground flex size-9 items-center justify-center">
                <MoreHorizontal className="size-4" />
              </span>
            </Link>
          ))}
          {filteredDocuments.length === 0 && (
            <div className="p-12 text-center">
              <Search className="text-muted-foreground mx-auto size-6" />
              <h3 className="mt-4 text-sm font-semibold">
                No documents found
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Try another search term.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
