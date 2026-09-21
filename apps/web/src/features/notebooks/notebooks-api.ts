import { apiFetch } from '@/lib/api/client';

import type { NotebookDetail, NotebookSummary, PaperType } from './notebook-types';

export function listNotebooks() {
  return apiFetch<NotebookSummary[]>('/notebooks');
}

export function getNotebook(notebookId: string) {
  return apiFetch<NotebookDetail>(`/notebooks/${notebookId}`);
}

export function createNotebook(input: { title: string; paperType?: PaperType }) {
  return apiFetch<NotebookDetail>('/notebooks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateNotebook(
  notebookId: string,
  input: {
    title?: string;
    paperType?: PaperType;
    pages?: NotebookDetail['pages'];
  },
) {
  return apiFetch<NotebookDetail>(`/notebooks/${notebookId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteNotebook(notebookId: string) {
  return apiFetch<{ id: string }>(`/notebooks/${notebookId}`, {
    method: 'DELETE',
  });
}
