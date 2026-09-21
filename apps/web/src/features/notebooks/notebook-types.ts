export type PaperType = 'blank' | 'lined' | 'grid' | 'dotted';

export type NotebookPoint = { x: number; y: number };

export type NotebookStroke = {
  id: string;
  tool: 'pen' | 'highlight';
  points: NotebookPoint[];
};

export type NotebookImage = {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
};

export type NotebookPage = {
  id: string;
  text: string;
  strokes: NotebookStroke[];
  images: NotebookImage[];
};

export type NotebookSummary = {
  id: string;
  title: string;
  paperType: PaperType;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type NotebookDetail = NotebookSummary & {
  pages: NotebookPage[];
};

export function normalizePage(page: Partial<NotebookPage> & { id?: string }): NotebookPage {
  return {
    id: page.id ?? crypto.randomUUID(),
    text: page.text ?? '',
    strokes: Array.isArray(page.strokes) ? page.strokes : [],
    images: Array.isArray(page.images) ? page.images : [],
  };
}
