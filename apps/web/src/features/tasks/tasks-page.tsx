import {
  CalendarClock,
  Check,
  Circle,
  Filter,
  ListChecks,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/workspace/page-header';
import { PreviewNotice } from '@/components/workspace/preview-notice';
import { cn } from '@/lib/utils';

type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed';

type PreviewTask = {
  id: number;
  title: string;
  subject: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  subtasks: string;
  color: string;
};

const previewTasks: PreviewTask[] = [
  {
    id: 1,
    title: 'Review cellular respiration notes',
    subject: 'Biology',
    due: 'Today · 2:30 PM',
    priority: 'High',
    completed: false,
    subtasks: '2 of 4',
    color: 'bg-emerald-500',
  },
  {
    id: 2,
    title: 'Draft comparative essay outline',
    subject: 'Literature',
    due: 'Today · 5:00 PM',
    priority: 'Medium',
    completed: false,
    subtasks: '1 of 3',
    color: 'bg-amber-500',
  },
  {
    id: 3,
    title: 'Complete problem set 6',
    subject: 'Calculus',
    due: 'Tomorrow · 9:00 AM',
    priority: 'High',
    completed: false,
    subtasks: '5 of 8',
    color: 'bg-sky-500',
  },
  {
    id: 4,
    title: 'Read chapter: The Age of Reason',
    subject: 'History',
    due: 'Sep 24',
    priority: 'Low',
    completed: false,
    subtasks: '0 of 2',
    color: 'bg-violet-500',
  },
  {
    id: 5,
    title: 'Submit lab safety reflection',
    subject: 'Chemistry',
    due: 'Completed today',
    priority: 'Medium',
    completed: true,
    subtasks: '3 of 3',
    color: 'bg-rose-500',
  },
];

const filters: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All tasks' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

export function TasksPage() {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');

  const tasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return previewTasks.filter((task) => {
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.subject.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && task.completed) ||
        (filter === 'today' && task.due.startsWith('Today')) ||
        (filter === 'upcoming' &&
          !task.completed &&
          !task.due.startsWith('Today'));
      return matchesQuery && matchesFilter;
    });
  }, [filter, search]);

  return (
    <div className="space-y-7">
      <PageHeader
        icon={ListChecks}
        eyebrow="Plan with intention"
        title="Tasks"
        description="Turn assignments into clear next steps, group them by subject, and keep every deadline in view."
        action={
          <Button disabled title="Task creation will be connected to the API next">
            <Plus />
            New task
          </Button>
        }
      />

      <PreviewNotice>
        The layout, filters, and search are interactive using clearly marked
        example data. Creating and persisting tasks will be connected to the
        NestJS API in the task implementation phase.
      </PreviewNotice>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Open
            </span>
            <Circle className="text-amber-600 size-4" />
          </div>
          <strong className="mt-3 block font-serif text-3xl font-medium">
            4
          </strong>
          <p className="text-muted-foreground mt-1 text-xs">
            Across four subjects
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
            2
          </strong>
          <p className="text-muted-foreground mt-1 text-xs">
            Next at 2:30 PM
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
            1
          </strong>
          <p className="text-muted-foreground mt-1 text-xs">
            One thoughtful step forward
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
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                className="h-9 pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search preview tasks"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled
              title="Advanced filters arrive with task persistence"
            >
              <SlidersHorizontal />
            </Button>
          </div>
        </div>

        <div className="divide-y">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <article
                key={task.id}
                className="group grid gap-4 p-4 transition-colors hover:bg-muted/30 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5"
              >
                <button
                  type="button"
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full border transition-colors',
                    task.completed
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-border text-transparent',
                  )}
                  aria-label={`${task.completed ? 'Completed' : 'Incomplete'} preview task: ${task.title}`}
                  disabled
                  title="Completion will persist when the task API is connected"
                >
                  <Check className="size-3.5" />
                </button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('size-2 rounded-full', task.color)} />
                    <h3
                      className={cn(
                        'truncate text-sm font-semibold',
                        task.completed &&
                          'text-muted-foreground line-through',
                      )}
                    >
                      {task.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px]">
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span>{task.subject}</span>
                    <span>{task.due}</span>
                    <span>{task.subtasks} subtasks</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  title="Task actions arrive with persistence"
                >
                  <Filter />
                </Button>
              </article>
            ))
          ) : (
            <div className="p-12 text-center">
              <Search className="text-muted-foreground mx-auto size-6" />
              <h3 className="mt-4 text-sm font-semibold">No preview matches</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Try another filter or search term.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
