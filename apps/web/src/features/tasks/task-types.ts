export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Subtask = {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  subject: string | null;
  tags: string[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
};

export type SaveTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string | null;
  subject?: string;
  tags?: string[];
};
