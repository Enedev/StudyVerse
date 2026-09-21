import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/workspace/page-header';
import { cn } from '@/lib/utils';

import { useTasksQuery } from '../tasks/use-tasks';
import { CalendarEventEditor } from './calendar-event-editor';
import type { CalendarEvent } from './calendar-types';
import { useCalendarEventsQuery } from './use-calendar';

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function dateKey(value: Date | string) {
  const date = new Date(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function buildMonthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      current: date.getMonth() === month.getMonth(),
    };
  });
}

export function CalendarPage() {
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const cells = useMemo(() => buildMonthGrid(month), [month]);
  const rangeStart = cells[0]?.date ?? month;
  const lastCell = cells[cells.length - 1]?.date ?? month;
  const rangeEnd = new Date(lastCell);
  rangeEnd.setDate(rangeEnd.getDate() + 1);
  const eventsQuery = useCalendarEventsQuery(
    rangeStart.toISOString(),
    rangeEnd.toISOString(),
  );
  const tasksQuery = useTasksQuery();
  const events = eventsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const selectedKey = dateKey(selectedDate);
  const selectedEvents = events.filter(
    (event) => dateKey(event.startsAt) === selectedKey,
  );
  const selectedTasks = tasks.filter(
    (task) =>
      !!task.dueAt &&
      task.status !== 'archived' &&
      dateKey(task.dueAt) === selectedKey,
  );

  const openNewEvent = (date = selectedDate) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setEditorOpen(true);
  };

  const editEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditorOpen(true);
  };

  const changeMonth = (offset: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    setSelectedDate(next);
  };

  const loading = eventsQuery.isLoading || tasksQuery.isLoading;
  const hasError = eventsQuery.isError || tasksQuery.isError;

  return (
    <div className="space-y-7">
      <PageHeader
        icon={CalendarDays}
        eyebrow="See your rhythm"
        title="Calendar"
        description="A calm view of deadlines, classes, and the focused time you have set aside for learning."
        action={
          <Button onClick={() => openNewEvent()}>
            <Plus />
            New event
          </Button>
        }
      />

      {hasError && (
        <Card className="border-destructive/40 bg-destructive/5 flex items-start gap-3 p-4">
          <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold">Calendar data is unavailable</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Confirm that migrations 001 and 002 have been executed in
              Supabase, then try again.
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft />
              </Button>
              <h3 className="min-w-44 text-center font-serif text-xl font-medium">
                {new Intl.DateTimeFormat(undefined, {
                  month: 'long',
                  year: 'numeric',
                }).format(month)}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {loading && (
                <LoaderCircle className="text-muted-foreground size-4 animate-spin" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMonth(
                    new Date(today.getFullYear(), today.getMonth(), 1),
                  );
                  setSelectedDate(today);
                }}
              >
                Today
              </Button>
              <div className="bg-muted hidden rounded-lg p-1 sm:flex">
                <button className="bg-card rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm">
                  Month
                </button>
                <button
                  className="text-muted-foreground px-3 py-1.5 text-xs"
                  disabled
                  title="Week view is the next calendar increment"
                >
                  Week
                </button>
                <button
                  className="text-muted-foreground px-3 py-1.5 text-xs"
                  disabled
                  title="Day view is the next calendar increment"
                >
                  Day
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="text-muted-foreground border-r px-2 py-3 text-center text-[10px] font-semibold tracking-wider uppercase last:border-r-0 sm:text-xs"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cell) => {
              const key = dateKey(cell.date);
              const dayEvents = events.filter(
                (event) => dateKey(event.startsAt) === key,
              );
              const dayTasks = tasks.filter(
                (task) =>
                  !!task.dueAt &&
                  task.status !== 'archived' &&
                  dateKey(task.dueAt) === key,
              );
              const isSelected = key === selectedKey;
              const isToday = key === dateKey(today);

              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    'hover:bg-muted/35 min-h-20 border-r border-b p-1.5 text-left transition-colors last:border-r-0 sm:min-h-28 sm:p-2',
                    !cell.current && 'bg-muted/20 text-muted-foreground/45',
                    isSelected && 'bg-secondary/45',
                  )}
                  onClick={() => setSelectedDate(cell.date)}
                  onDoubleClick={() => openNewEvent(cell.date)}
                  aria-label={`Select ${cell.date.toDateString()}`}
                >
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full text-xs',
                      isSelected &&
                        'bg-primary text-primary-foreground font-semibold',
                      isToday && !isSelected && 'ring-primary ring-1',
                    )}
                  >
                    {cell.date.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="bg-card hidden truncate rounded border px-1.5 py-1 text-[9px] font-medium sm:block"
                      >
                        <span
                          className="mr-1 inline-block size-1.5 rounded-full"
                          style={{ backgroundColor: event.color ?? '#557387' }}
                        />
                        {event.title}
                      </div>
                    ))}
                    {dayTasks.slice(0, 1).map((task) => (
                      <div
                        key={task.id}
                        className="bg-secondary text-secondary-foreground hidden truncate rounded px-1.5 py-1 text-[9px] font-medium sm:block"
                      >
                        <CheckCircle2 className="mr-1 inline size-2.5" />
                        {task.title}
                      </div>
                    ))}
                    {(dayEvents.length > 0 || dayTasks.length > 0) && (
                      <div className="flex gap-0.5 sm:hidden">
                        {dayEvents.map((event) => (
                          <span
                            key={event.id}
                            className="size-1.5 rounded-full"
                            style={{
                              backgroundColor: event.color ?? '#557387',
                            }}
                          />
                        ))}
                        {dayTasks.map((task) => (
                          <span
                            key={task.id}
                            className="bg-secondary-foreground size-1.5 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Selected day
            </span>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <strong className="font-serif text-4xl font-medium">
                  {selectedDate.getDate()}
                </strong>
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Intl.DateTimeFormat(undefined, {
                    month: 'long',
                    year: 'numeric',
                  }).format(selectedDate)}
                </p>
              </div>
              <Badge variant="secondary">
                {selectedEvents.length + selectedTasks.length} items
              </Badge>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Day schedule</h3>
              <Clock3 className="text-muted-foreground size-4" />
            </div>
            <div className="mt-4 space-y-3">
              {selectedEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className="border-border/70 flex w-full gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
                  onClick={() => editEvent(event)}
                >
                  <span
                    className="mt-1 h-9 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: event.color ?? '#557387' }}
                  />
                  <div>
                    <time className="text-muted-foreground text-[10px]">
                      {event.isAllDay
                        ? 'All day'
                        : new Intl.DateTimeFormat(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                          }).format(new Date(event.startsAt))}
                    </time>
                    <h4 className="mt-0.5 text-xs font-semibold">
                      {event.title}
                    </h4>
                    <p className="text-muted-foreground mt-1 text-[10px]">
                      {event.subject ?? 'Event'}
                    </p>
                  </div>
                </button>
              ))}

              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-secondary/45 flex gap-3 rounded-lg p-3"
                >
                  <CheckCircle2 className="text-secondary-foreground mt-0.5 size-4 shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-[10px]">
                      Task deadline
                    </span>
                    <h4 className="mt-0.5 text-xs font-semibold">
                      {task.title}
                    </h4>
                    <p className="text-muted-foreground mt-1 text-[10px]">
                      {task.subject ?? 'No subject'}
                    </p>
                  </div>
                </div>
              ))}

              {selectedEvents.length === 0 && selectedTasks.length === 0 && (
                <div className="py-8 text-center">
                  <CalendarDays className="text-muted-foreground mx-auto size-5" />
                  <p className="text-muted-foreground mt-3 text-xs">
                    Nothing planned for this day.
                  </p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    size="sm"
                    onClick={() => openNewEvent()}
                  >
                    <Plus />
                    Add event
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-primary text-primary-foreground border-0 p-5">
            <p className="text-xs text-white/60">Study balance</p>
            <strong className="mt-2 block font-serif text-2xl font-medium">
              {events.length + tasks.filter((task) => task.dueAt).length}{' '}
              scheduled
            </strong>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Events and task deadlines stay together without duplicating data.
            </p>
          </Card>
        </aside>
      </div>

      {editorOpen && (
        <CalendarEventEditor
          event={selectedEvent}
          selectedDate={selectedDate}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
