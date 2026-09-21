import { useQueries } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  ListTodo,
  NotebookPen,
  Shapes,
  Sparkles,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/features/auth/use-auth';
import { listCalendarEvents } from '@/features/calendar/calendar-api';
import { listDocuments } from '@/features/documents/documents-api';
import { listBooks } from '@/features/library/library-api';
import { listNotebooks } from '@/features/notebooks/notebooks-api';
import { listTasks } from '@/features/tasks/tasks-api';
import { listWhiteboards } from '@/features/whiteboards/whiteboards-api';

function weekRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { from: start.toISOString(), to: end.toISOString() };
}

function formatWhen(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function DashboardPage() {
  const { user } = useAuth();
  const range = useMemo(() => weekRange(), []);
  const firstName =
    String(user?.user_metadata.display_name ?? 'there').split(' ')[0] ??
    'there';
  const [tasksQuery, eventsQuery, boardsQuery, notebooksQuery, booksQuery, documentsQuery] =
    useQueries({
      queries: [
        { queryKey: ['tasks'], queryFn: listTasks },
        {
          queryKey: ['calendar-events', range.from, range.to],
          queryFn: () => listCalendarEvents(range.from, range.to),
        },
        { queryKey: ['whiteboards'], queryFn: listWhiteboards },
        { queryKey: ['notebooks'], queryFn: listNotebooks },
        { queryKey: ['books', '', ''], queryFn: () => listBooks() },
        { queryKey: ['documents'], queryFn: listDocuments },
      ],
    });

  const tasks = tasksQuery.data ?? [];
  const openTasks = tasks.filter(
    (task) => task.status === 'todo' || task.status === 'in_progress',
  );
  const dueSoon = openTasks
    .filter((task) => task.dueAt)
    .sort((left, right) => Date.parse(left.dueAt ?? '') - Date.parse(right.dueAt ?? ''));
  const events = [...(eventsQuery.data ?? [])].sort(
    (left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt),
  );
  const books = [...(booksQuery.data ?? [])].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
  );
  const documents = [...(documentsQuery.data ?? [])].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
  );
  const boards = boardsQuery.data ?? [];
  const notebooks = notebooksQuery.data ?? [];

  const spaces = [
    {
      title: 'Tasks',
      detail: tasksQuery.isSuccess ? `${openTasks.length} open` : 'Tasks',
      href: '/tasks',
      icon: ListTodo,
    },
    {
      title: 'Calendar',
      detail: eventsQuery.isSuccess ? `${events.length} this week` : 'Calendar',
      href: '/calendar',
      icon: CalendarDays,
    },
    {
      title: 'Whiteboards',
      detail: boardsQuery.isSuccess ? `${boards.length} boards` : 'Whiteboards',
      href: '/whiteboards',
      icon: Shapes,
    },
    {
      title: 'Notebooks',
      detail: notebooksQuery.isSuccess ? `${notebooks.length} notebooks` : 'Notebooks',
      href: '/notebooks',
      icon: NotebookPen,
    },
    {
      title: 'Library',
      detail: booksQuery.isSuccess ? `${books.length} books` : 'Library',
      href: '/library',
      icon: BookOpen,
    },
    {
      title: 'Documents',
      detail: documentsQuery.isSuccess ? `${documents.length} PDFs` : 'Documents',
      href: '/documents',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl p-7 shadow-lg sm:p-9">
        <div className="absolute -top-16 -right-10 size-52 rounded-full border border-white/10" />
        <div className="absolute -right-16 -bottom-24 size-72 rounded-full border border-white/10" />
        <div className="relative">
          <span className="text-accent flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="size-4" />
            Overview
          </span>
          <h2 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">
            Good to see you, {firstName}.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {tasksQuery.isSuccess && eventsQuery.isSuccess && booksQuery.isSuccess && documentsQuery.isSuccess
              ? `${openTasks.length} open tasks, ${events.length} events this week, and ${books.length + documents.length} things to read.`
              : 'Gathering your tasks, calendar, and reading.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" asChild>
              <Link to="/tasks">
                Continue with tasks
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" asChild>
              <Link to="/calendar">Open calendar</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {spaces.map(({ title, detail, href, icon: Icon }) => (
          <Link key={href} to={href}>
            <Card className="group h-full p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="bg-secondary text-secondary-foreground flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-4.5" />
                </div>
                <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{detail}</p>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Up next</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/calendar">Calendar</Link>
            </Button>
          </div>
          {dueSoon.length === 0 && events.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing scheduled. Add a task due date or a calendar event.
            </p>
          ) : (
            <div className="space-y-2">
              {dueSoon.slice(0, 4).map((task) => (
                <Link
                  key={task.id}
                  to="/tasks"
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{task.title}</span>
                    <span className="text-muted-foreground text-xs">
                      Task · {task.dueAt ? formatWhen(task.dueAt) : 'No date'}
                    </span>
                  </span>
                  <ListTodo className="text-muted-foreground size-4 shrink-0" />
                </Link>
              ))}
              {events.slice(0, 4).map((event) => (
                <Link
                  key={event.id}
                  to="/calendar"
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{event.title}</span>
                    <span className="text-muted-foreground text-xs">
                      Event · {formatWhen(event.startsAt)}
                    </span>
                  </span>
                  <CalendarDays className="text-muted-foreground size-4 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Continue</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/library">Library</Link>
            </Button>
          </div>
          {books.length === 0 && documents.length === 0 && boards.length === 0 && notebooks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Your recent books, PDFs, boards, and notebooks will show up here.
            </p>
          ) : (
            <div className="space-y-2">
              {books.slice(0, 2).map((book) => (
                <Link
                  key={book.id}
                  to={`/library/${book.id}`}
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{book.title}</span>
                    <span className="text-muted-foreground text-xs">
                      Library · {book.readingProgress}% · page {book.lastOpenedPage}
                    </span>
                  </span>
                  <BookOpen className="text-muted-foreground size-4 shrink-0" />
                </Link>
              ))}
              {documents.slice(0, 2).map((document) => (
                <Link
                  key={document.id}
                  to={`/documents/${document.id}`}
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{document.title}</span>
                    <span className="text-muted-foreground text-xs">
                      PDF · page {document.lastOpenedPage}
                    </span>
                  </span>
                  <FileText className="text-muted-foreground size-4 shrink-0" />
                </Link>
              ))}
              {boards.slice(0, 2).map((board) => (
                <Link
                  key={board.id}
                  to={`/whiteboards/${board.id}`}
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{board.title}</span>
                    <span className="text-muted-foreground text-xs capitalize">
                      Whiteboard · {board.role}
                    </span>
                  </span>
                  <Shapes className="text-muted-foreground size-4 shrink-0" />
                </Link>
              ))}
              {notebooks.slice(0, 2).map((notebook) => (
                <Link
                  key={notebook.id}
                  to={`/notebooks/${notebook.id}`}
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{notebook.title}</span>
                    <span className="text-muted-foreground text-xs">
                      Notebook · {notebook.pageCount} pages
                    </span>
                  </span>
                  <NotebookPen className="text-muted-foreground size-4 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
