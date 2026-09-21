import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, LoaderCircle, NotebookPen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/workspace/page-header';

import { createNotebook, deleteNotebook, listNotebooks } from './notebooks-api';
import type { PaperType } from './notebook-types';

const paperLabels: Record<PaperType, string> = {
  blank: 'Blank',
  lined: 'Lined',
  grid: 'Grid',
  dotted: 'Dotted',
};

export function NotebooksPage() {
  const [title, setTitle] = useState('');
  const [paperType, setPaperType] = useState<PaperType>('lined');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notebooksQuery = useQuery({
    queryKey: ['notebooks'],
    queryFn: listNotebooks,
  });
  const createMutation = useMutation({
    mutationFn: createNotebook,
    onSuccess: async (notebook) => {
      await queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      navigate(`/notebooks/${notebook.id}`);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteNotebook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notebooks'] }),
  });
  const notebooks = notebooksQuery.data ?? [];

  const create = async () => {
    if (!title.trim()) return;
    try {
      await createMutation.mutateAsync({ title: title.trim(), paperType });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create the notebook.');
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        icon={NotebookPen}
        eyebrow="Pages you can keep"
        title="Notebooks"
        description="Open a notebook, choose the paper, then write or draw. Every page is saved to your account."
      />
      <Card className="grid gap-3 p-4 sm:grid-cols-[1fr_10rem_auto]">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Notebook title"
          maxLength={240}
        />
        <select
          className="border-input bg-background h-11 rounded-lg border px-3 text-sm"
          value={paperType}
          onChange={(event) => setPaperType(event.target.value as PaperType)}
        >
          {Object.entries(paperLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <Button onClick={() => void create()} disabled={!title.trim() || createMutation.isPending}>
          {createMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Plus />}
          Create
        </Button>
      </Card>
      {notebooksQuery.isLoading ? (
        <div className="text-muted-foreground flex justify-center py-16"><LoaderCircle className="animate-spin" /></div>
      ) : notebooksQuery.isError ? (
        <Card className="p-10 text-center">
          <AlertCircle className="text-destructive mx-auto size-6" />
          <p className="mt-3 text-sm">Run migration 007 in Supabase, then refresh.</p>
        </Card>
      ) : notebooks.length === 0 ? (
        <Card className="border-dashed p-12 text-center shadow-none">
          <NotebookPen className="text-muted-foreground mx-auto size-6" />
          <h2 className="mt-4 font-semibold">No notebooks yet</h2>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {notebooks.map((notebook) => (
            <Card key={notebook.id} className="flex items-center gap-4 p-4">
              <Link to={`/notebooks/${notebook.id}`} className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">{notebook.title}</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  {paperLabels[notebook.paperType]} · {notebook.pageCount} page
                  {notebook.pageCount === 1 ? '' : 's'}
                </p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${notebook.title}`}
                onClick={() => {
                  if (window.confirm(`Delete "${notebook.title}"?`)) {
                    deleteMutation.mutate(notebook.id);
                  }
                }}
              >
                <Trash2 />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
