import { apiFetch } from '@/lib/api/client';

import type { SaveTaskInput, Subtask, Task } from './task-types';

export function listTasks() {
  return apiFetch<Task[]>('/tasks');
}

export function createTask(input: SaveTaskInput) {
  return apiFetch<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTask(taskId: string, input: Partial<SaveTaskInput>) {
  return apiFetch<Task>(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteTask(taskId: string) {
  return apiFetch<{ id: string }>(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export function addSubtask(taskId: string, title: string, position: number) {
  return apiFetch<Subtask>(`/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify({ title, position }),
  });
}

export function updateSubtask(
  taskId: string,
  subtaskId: string,
  input: { title?: string; isCompleted?: boolean; position?: number },
) {
  return apiFetch<Subtask>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteSubtask(taskId: string, subtaskId: string) {
  return apiFetch<{ id: string }>(
    `/tasks/${taskId}/subtasks/${subtaskId}`,
    { method: 'DELETE' },
  );
}
