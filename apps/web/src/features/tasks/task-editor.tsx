import {
  Check,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type {
  SaveTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
} from './task-types';
import {
  useAddSubtaskMutation,
  useCreateTaskMutation,
  useDeleteSubtaskMutation,
  useUpdateSubtaskMutation,
  useUpdateTaskMutation,
} from './use-tasks';

type TaskEditorProps = {
  task: Task | null;
  onClose: () => void;
};

function toLocalDateTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function TaskEditor({ task, onClose }: TaskEditorProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [subject, setSubject] = useState(task?.subject ?? '');
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? 'medium',
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo');
  const [dueAt, setDueAt] = useState(toLocalDateTime(task?.dueAt ?? null));
  const [tags, setTags] = useState(task?.tags.join(', ') ?? '');
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const createTask = useCreateTaskMutation();
  const updateTask = useUpdateTaskMutation();
  const addSubtask = useAddSubtaskMutation();
  const updateSubtask = useUpdateSubtaskMutation();
  const deleteSubtask = useDeleteSubtaskMutation();
  const isSaving = createTask.isPending || updateTask.isPending;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const input: SaveTaskInput = {
      title,
      description,
      subject,
      priority,
      status,
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      if (task) {
        await updateTask.mutateAsync({ taskId: task.id, input });
        toast.success('Task updated.');
      } else {
        await createTask.mutateAsync(input);
        toast.success('Task created.');
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save.');
    }
  };

  const createSubtask = async () => {
    if (!task || !subtaskTitle.trim()) return;
    try {
      await addSubtask.mutateAsync({
        taskId: task.id,
        title: subtaskTitle.trim(),
        position: task.subtasks.length,
      });
      setSubtaskTitle('');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to add subtask.',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close task editor"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-editor-title"
        className="bg-background absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-muted-foreground text-xs">
              {task ? 'Edit task' : 'New task'}
            </p>
            <h2 id="task-editor-title" className="font-serif text-2xl">
              {task ? task.title : 'Plan your next step'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        <form
          className="min-h-0 flex-1 overflow-y-auto p-5"
          onSubmit={(event) => void submit(event)}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Title</Label>
              <Input
                id="taskTitle"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What needs your attention?"
                maxLength={240}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description</Label>
              <textarea
                id="taskDescription"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add context, instructions, or a helpful note."
                rows={4}
                className="border-input bg-background/70 focus-visible:border-ring focus-visible:ring-ring/25 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taskSubject">Subject</Label>
                <Input
                  id="taskSubject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Biology"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDue">Due date</Label>
                <Input
                  id="taskDue"
                  type="datetime-local"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taskPriority">Priority</Label>
                <select
                  id="taskPriority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as TaskPriority)
                  }
                  className="border-input bg-background h-11 w-full rounded-lg border px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskStatus">Status</Label>
                <select
                  id="taskStatus"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TaskStatus)
                  }
                  className="border-input bg-background h-11 w-full rounded-lg border px-3 text-sm"
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskTags">Tags</Label>
              <Input
                id="taskTags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="exam, chapter-4, review"
              />
              <p className="text-muted-foreground text-[10px]">
                Separate tags with commas.
              </p>
            </div>

            {task && (
              <div className="space-y-3 border-t pt-5">
                <div>
                  <Label>Subtasks</Label>
                  <p className="text-muted-foreground mt-1 text-[10px]">
                    Break this task into smaller, finishable steps.
                  </p>
                </div>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="bg-muted/45 flex items-center gap-2 rounded-lg p-2"
                    >
                      <button
                        type="button"
                        className={`flex size-6 items-center justify-center rounded-full border ${
                          subtask.isCompleted
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'text-transparent'
                        }`}
                        onClick={() =>
                          updateSubtask.mutate({
                            taskId: task.id,
                            subtaskId: subtask.id,
                            isCompleted: !subtask.isCompleted,
                          })
                        }
                      >
                        <Check className="size-3" />
                      </button>
                      <span
                        className={`flex-1 text-xs ${
                          subtask.isCompleted
                            ? 'text-muted-foreground line-through'
                            : ''
                        }`}
                      >
                        {subtask.title}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          deleteSubtask.mutate({
                            taskId: task.id,
                            subtaskId: subtask.id,
                          })
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={subtaskTitle}
                    onChange={(event) => setSubtaskTitle(event.target.value)}
                    placeholder="Add a subtask"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void createSubtask();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={
                      !subtaskTitle.trim() || addSubtask.isPending
                    }
                    onClick={() => void createSubtask()}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-7 flex justify-end gap-2 border-t pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !title.trim()}>
              {isSaving && <LoaderCircle className="animate-spin" />}
              {task ? 'Save changes' : 'Create task'}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
