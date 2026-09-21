export type StudyDocument = {
  id: string;
  title: string;
  originalFilename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  pageCount: number | null;
  lastOpenedPage: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentAnnotation = {
  id: string;
  documentId: string;
  annotationType: 'highlight' | 'underline' | 'text' | 'drawing' | 'note' | 'bookmark';
  pageNumber: number;
  geometry: Record<string, unknown> | null;
  content: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};
