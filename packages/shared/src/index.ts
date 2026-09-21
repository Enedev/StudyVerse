export type ApiStatus = {
  status: 'ok';
  service: 'studyverse-api';
  timestamp: string;
};

export type UserProfile = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = [
  'todo',
  'in_progress',
  'completed',
  'archived',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
