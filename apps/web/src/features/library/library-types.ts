export type Book = {
  id: string;
  title: string;
  author: string | null;
  documentId: string | null;
  coverPath: string | null;
  categories: string[];
  readingProgress: number;
  lastOpenedPage: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaveBookInput = {
  title: string;
  author?: string;
  documentId?: string;
  coverPath?: string;
  categories?: string[];
  readingProgress?: number;
  lastOpenedPage?: number;
};
