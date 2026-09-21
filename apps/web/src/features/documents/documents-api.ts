import { apiFetch } from '@/lib/api/client';

import type { DocumentAnnotation, StudyDocument } from './document-types';

export function listDocuments() {
  return apiFetch<StudyDocument[]>('/documents');
}

export function getDocument(documentId: string) {
  return apiFetch<StudyDocument>(`/documents/${documentId}`);
}

export function createDocument(input: {
  title: string;
  originalFilename: string;
  storagePath: string;
  sizeBytes: number;
  pageCount?: number;
}) {
  return apiFetch<StudyDocument>('/documents', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateDocument(
  documentId: string,
  input: { title?: string; pageCount?: number; lastOpenedPage?: number },
) {
  return apiFetch<StudyDocument>(`/documents/${documentId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteDocument(documentId: string) {
  return apiFetch<{ id: string }>(`/documents/${documentId}`, {
    method: 'DELETE',
  });
}

export function listAnnotations(documentId: string) {
  return apiFetch<DocumentAnnotation[]>(`/documents/${documentId}/annotations`);
}

export function createAnnotation(
  documentId: string,
  input: {
    annotationType: 'note' | 'bookmark';
    pageNumber: number;
    content?: string;
  },
) {
  return apiFetch<DocumentAnnotation>(`/documents/${documentId}/annotations`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteAnnotation(documentId: string, annotationId: string) {
  return apiFetch<{ id: string }>(
    `/documents/${documentId}/annotations/${annotationId}`,
    { method: 'DELETE' },
  );
}
