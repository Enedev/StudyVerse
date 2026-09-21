export type WhiteboardRole = 'owner' | 'editor' | 'viewer';

export type WhiteboardSummary = {
  id: string;
  title: string;
  role: WhiteboardRole;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
};

export type WhiteboardMember = {
  userId: string;
  role: 'viewer' | 'editor';
  createdAt: string;
};

export type WhiteboardDetail = WhiteboardSummary & {
  snapshot: Record<string, unknown>;
  members: WhiteboardMember[];
};
