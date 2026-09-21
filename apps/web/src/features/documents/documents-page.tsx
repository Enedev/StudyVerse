import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  FileText,
  LoaderCircle,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/workspace/page-header';
import { useAuth } from '@/features/auth/use-auth';
import { uploadPrivateFile } from '@/lib/storage';

import { createDocument, deleteDocument, listDocuments } from './documents-api';

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPage() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: listDocuments,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });
  const documents = documentsQuery.data ?? [];

  const upload = async (file: File | undefined) => {
    if (!file || !user) return;
    if (file.type !== 'application/pdf') {
      toast.error('Choose a PDF file.');
      return;
    }
    setIsUploading(true);
    const storagePath = `${user.id}/${crypto.randomUUID()}.pdf`;
    try {
      await uploadPrivateFile('documents', storagePath, file);
      await createDocument({
        title: file.name.replace(/\.pdf$/i, ''),
        originalFilename: file.name,
        storagePath,
        sizeBytes: file.size,
      });
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('PDF uploaded.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        icon={FileText}
        eyebrow="Read with purpose"
        title="Documents"
        description="Upload private PDFs, continue from your last page, and keep notes beside the reading."
        action={
          <Button asChild disabled={isUploading}>
            <label>
              {isUploading ? <LoaderCircle className="animate-spin" /> : <Upload />}
              Upload PDF
              <input
                className="hidden"
                type="file"
                accept="application/pdf"
                onChange={(event) => void upload(event.target.files?.[0])}
              />
            </label>
          </Button>
        }
      />

      {documentsQuery.isLoading ? (
        <div className="text-muted-foreground flex justify-center py-16"><LoaderCircle className="animate-spin" /></div>
      ) : documentsQuery.isError ? (
        <Card className="p-10 text-center">
          <AlertCircle className="text-destructive mx-auto size-6" />
          <p className="mt-3 text-sm">Run migrations 001 through 005, including the private documents bucket.</p>
        </Card>
      ) : documents.length === 0 ? (
        <Card className="border-dashed p-12 text-center shadow-none">
          <FileText className="text-muted-foreground mx-auto size-6" />
          <h2 className="mt-4 font-semibold">No documents yet</h2>
          <p className="text-muted-foreground mt-2 text-sm">Upload a PDF to start reading.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {documents.map((document) => (
            <Card key={document.id} className="flex items-center gap-4 p-4">
              <div className="bg-secondary text-secondary-foreground flex size-12 items-center justify-center rounded-xl">
                <FileText className="size-5" />
              </div>
              <Link to={`/documents/${document.id}`} className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">{document.title}</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  {document.originalFilename} · {formatSize(document.sizeBytes)} · page {document.lastOpenedPage}
                </p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${document.title}`}
                onClick={() => {
                  if (window.confirm(`Delete "${document.title}"?`)) {
                    deleteMutation.mutate(document.id);
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
