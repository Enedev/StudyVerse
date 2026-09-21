import {
  AlertCircle,
  CalendarClock,
  Check,
  Circle,
  ListChecks,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/workspace/page-header';
import { cn } from '@/lib/utils';

import { TaskEditor } from './task-editor';
import type { Task } from './task-types';
import {
  useDeleteTaskMutation,
  useTasksQuery,
  useUpdateTaskMutation,
} from './use-tasks';

type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed';

const filters: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All tasks' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

const subjectColors = [
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
];
const emptyTasks: Task[] = [];

function isToday(value: string | null) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function formatDue(value: string | null) {
  if (!value) return 'No due date';
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function colorFor(subject: string | null) {
  if (!subject) return 'bg-slate-400';
  const total = [...subject].reduce((sum, character) => {
    return sum + character.charCodeAt(0);
  }, 0);
  return subjectColors[total % subjectColors.length] ?? 'bg-slate-400';
}

export function TasksPage() {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tasksQuery = useTasksQuery();
  const updateTask = useUpdateTaskMutation();
  const deleteTask = useDeleteTaskMutation();
  const allTasks = tasksQuery.data ?? emptyTasks;

  const tasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allTasks.filter((task) => {
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.subject?.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && task.status === 'completed') ||
        (filter === 'today' &&
          task.status !== 'completed' &&
          isToday(task.dueAt)) ||
        (filter === 'upcoming' &&
          task.status !== 'completed' &&
          !!task.dueAt &&
          !isToday(task.dueAt));
      return matchesQuery && matchesFilter;
    });
  }, [allTasks, filter, search]);

  const openCount = allTasks.filter(
    (task) => !['completed', 'archived'].includes(task.status),
  ).length;
  const todayCount = allTasks.filter(
    (task) => task.status !== 'completed' && isToday(task.dueAt),
  ).length;
  const completeCount = allTasks.filter(
    (task) => task.status === 'completed',
  ).length;

  const openNewTask = () => {
    setSelectedTask(null);
    setEditorOpen(true);
  };

  const editTask = (task: Task) => {
    setSelectedTask(task);
    setEditorOpen(true);
  };

  const toggleTask = async (task: Task) => {
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        input: {
          status: task.status === 'completed' ? 'todo' : 'completed',
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to update task.',
      );
    }
  };

  const removeTask = async (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success('Task deleted.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete task.',
      );
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        icon={ListChecks}
        eyebrow="Plan with intention"
        title="Tasks"
        description="Turn assignments into clear next steps, group them by subject, and keep every deadline in view."
        action={
          <Button onClick={openNewTask}>
            <Plus />
            New task
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Open
            </span>
            <Circle className="text-amber-600 size-4" />
          </div>
          <strong className="mt-3 block font-serif text-3xl font-medium">
            {openCount}
          </strong>
          <p className="text-muted-foreground mt-1 text-xs">
            Tasks that still need attention
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Due today
            </span>
            <CalendarClock className="text-sky-600 size-4" />
          </div>
          <strong className="mt-3 block font-serif text-3xl font-medium">
            {todayCount}
          </strong>
          <p className="text-muted-foreground mt-1 text-xs">
            Deadlines on today’s page
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Complete
            </span>
            <Check className="text-emerald-600 size-4" />
          </div>
          <strong className="mt-3 block font-serif text-3xl font-medium">
            {completeCount}
          </strong>
          <p className="text-muted-foreground mt-1 text-xs">
            Finished across your workspace
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                  filter === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="h-9 pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
            />
          </div>
        </div>

        {tasksQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 p-16">
            <LoaderCircle className="text-muted-foreground size-5 animate-spin" />
            <span className="text-muted-foreground text-sm">
              Loading tasks…
            </span>
          </div>
        ) : tasksQuery.isError ? (
          <div className="p-12 text-center">
            <AlertCircle className="text-destructive mx-auto size-6" />
            <h3 className="mt-4 text-sm font-semibold">Tasks are unavailable</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-xs leading-relaxed">
              {tasksQuery.error.message === 'Failed to fetch'
                ? 'The API on port 3000 is not running. Start it, then try again.'
                : `${tasksQuery.error.message} Confirm that migrations 001 and 002 have been executed in Supabase.`}
            </p>
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => void tasksQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : tasks.length > 0 ? (
          <div className="divide-y">
            {tasks.map((task) => {
              const completedSubtasks = task.subtasks.filter(
                (subtask) => subtask.isCompleted,
              ).length;
              return (
                <article
                  key={task.id}
                  className="group grid gap-4 p-4 transition-colors hover:bg-muted/30 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5"
                >
                  <button
                    type="button"
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full border transition-colors',
                      task.status === 'completed'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-border text-transparent hover:border-emerald-600',
                    )}
                    aria-label={`${task.status === 'completed' ? 'Reopen' : 'Complete'} ${task.title}`}
                    onClick={() => void toggleTask(task)}
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="min-w-0 text-left"
                    onClick={() => editTask(task)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'size-2 rounded-full',
                          colorFor(task.subject),
                        )}
                      />
                      <h3
                        className={cn(
                          'truncate text-sm font-semibold',
                          task.status === 'completed' &&
                            'text-muted-foreground line-through',
                        )}
                      >
                        {task.title}
                      </h3>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span>{task.subject ?? 'No subject'}</span>
                      <span>{formatDue(task.dueAt)}</span>
                      <span>
                        {completedSubtasks} of {task.subtasks.length} subtasks
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editTask(task)}
                      aria-label={`Edit ${task.title}`}
                    >
                      <MoreHorizontal />
                    </Button>
                    <Button
                      className="text-muted-foreground hover:text-destructive"
                      variant="ghost"
                      size="icon"
                      onClick={() => void removeTask(task)}
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-14 text-center">
            <div className="bg-muted mx-auto flex size-12 items-center justify-center rounded-xl">
              <ListChecks className="text-muted-foreground size-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">
              {allTasks.length === 0
                ? 'Your first task starts here'
                : 'No tasks match this view'}
            </h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-xs leading-relaxed">
              {allTasks.length === 0
                ? 'Create a task, choose a deadline, and break it into smaller steps.'
                : 'Try another filter or search term.'}
            </p>
            {allTasks.length === 0 && (
              <Button className="mt-5" onClick={openNewTask}>
                <Plus />
                Create task
              </Button>
            )}
          </div>
        )}
      </Card>

      {editorOpen && (
        <TaskEditor
          task={selectedTask}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
