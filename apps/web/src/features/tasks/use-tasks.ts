import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addSubtask,
  createTask,
  deleteSubtask,
  deleteTask,
  listTasks,
  updateSubtask,
  updateTask,
} from './tasks-api';
import type { SaveTaskInput } from './task-types';

const tasksKey = ['tasks'] as const;

export function useTasksQuery() {
  return useQuery({
    queryKey: tasksKey,
    queryFn: listTasks,
  });
}

function useRefreshTasks() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: tasksKey });
}

export function useCreateTaskMutation() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: createTask,
    onSuccess: refresh,
  });
}

export function useUpdateTaskMutation() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: string;
      input: Partial<SaveTaskInput>;
    }) => updateTask(taskId, input),
    onSuccess: refresh,
  });
}

export function useDeleteTaskMutation() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: refresh,
  });
}

export function useAddSubtaskMutation() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: ({
      taskId,
      title,
      position,
    }: {
      taskId: string;
      title: string;
      position: number;
    }) => addSubtask(taskId, title, position),
    onSuccess: refresh,
  });
}

export function useUpdateSubtaskMutation() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: ({
      taskId,
      subtaskId,
      isCompleted,
    }: {
      taskId: string;
      subtaskId: string;
      isCompleted: boolean;
    }) => updateSubtask(taskId, subtaskId, { isCompleted }),
    onSuccess: refresh,
  });
}

export function useDeleteSubtaskMutation() {
  const refresh = useRefreshTasks();
  return useMutation({
    mutationFn: ({
      taskId,
      subtaskId,
    }: {
      taskId: string;
      subtaskId: string;
    }) => deleteSubtask(taskId, subtaskId),
    onSuccess: refresh,
  });
}
