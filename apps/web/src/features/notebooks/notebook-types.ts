export type PaperType = 'blank' | 'lined' | 'grid' | 'dotted';
export type NotebookPageMode = 'write' | 'draw';

export type NotebookPage = {
  id: string;
  mode: NotebookPageMode;
  text: string;
  scene: Record<string, unknown> | null;
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
