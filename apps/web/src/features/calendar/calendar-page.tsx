import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/workspace/page-header';
import { PreviewNotice } from '@/components/workspace/preview-notice';
import { cn } from '@/lib/utils';

type CalendarCell = {
  day: number;
  current: boolean;
};

const cells: CalendarCell[] = [
  { day: 31, current: false },
  ...Array.from({ length: 30 }, (_, index) => ({
    day: index + 1,
    current: true,
  })),
  { day: 1, current: false },
  { day: 2, current: false },
  { day: 3, current: false },
  { day: 4, current: false },
];

const events = [
  {
    day: 21,
    time: '10:30',
    title: 'Research presentation',
    subject: 'Biology',
    color: 'bg-emerald-500',
  },
  {
    day: 21,
    time: '15:00',
    title: 'Essay focus block',
    subject: 'Literature',
    color: 'bg-amber-500',
  },
  {
    day: 23,
    time: '09:00',
    title: 'Calculus problem set',
    subject: 'Calculus',
    color: 'bg-sky-500',
  },
  {
    day: 25,
    time: '13:30',
    title: 'Study group',
    subject: 'History',
    color: 'bg-violet-500',
  },
];

export function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState(21);
  const selectedEvents = events.filter((event) => event.day === selectedDay);

  return (
    <div className="space-y-7">
      <PageHeader
        icon={CalendarDays}
        eyebrow="See your rhythm"
        title="Calendar"
        description="A calm view of deadlines, classes, and the focused time you have set aside for learning."
        action={
          <Button disabled title="Event creation will be connected next">
            <Plus />
            New event
          </Button>
        }
      />

      <PreviewNotice>
        This month view uses example events and supports day selection. Event
        creation, recurrence, and persistence will be added with the calendar
        API.
      </PreviewNotice>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled
                aria-label="Previous month"
              >
                <ChevronLeft />
              </Button>
              <h3 className="min-w-40 text-center font-serif text-xl font-medium">
                September 2026
              </h3>
              <Button
                variant="ghost"
                size="icon"
                disabled
                aria-label="Next month"
              >
                <ChevronRight />
              </Button>
            </div>
            <div className="bg-muted flex rounded-lg p-1">
              <button className="bg-card rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm">
                Month
              </button>
              <button
                className="text-muted-foreground px-3 py-1.5 text-xs"
                disabled
                title="Week view is planned"
              >
                Week
              </button>
              <button
                className="text-muted-foreground px-3 py-1.5 text-xs"
                disabled
                title="Day view is planned"
              >
                Day
              </button>
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
            {cells.map((cell, index) => {
              const dayEvents = cell.current
                ? events.filter((event) => event.day === cell.day)
                : [];
              const isSelected = cell.current && selectedDay === cell.day;
              return (
                <button
                  key={`${cell.day}-${index}`}
                  type="button"
                  className={cn(
                    'hover:bg-muted/35 min-h-20 border-r border-b p-1.5 text-left transition-colors last:border-r-0 sm:min-h-28 sm:p-2',
                    !cell.current && 'bg-muted/20 text-muted-foreground/45',
                    isSelected && 'bg-secondary/45',
                  )}
                  onClick={() => cell.current && setSelectedDay(cell.day)}
                  aria-label={`Select September ${cell.day}`}
                >
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full text-xs',
                      isSelected &&
                        'bg-primary text-primary-foreground font-semibold',
                    )}
                  >
                    {cell.day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.title}
                        className="bg-card hidden truncate rounded border px-1.5 py-1 text-[9px] font-medium sm:block"
                      >
                        <span
                          className={cn(
                            'mr-1 inline-block size-1.5 rounded-full',
                            event.color,
                          )}
                        />
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 sm:hidden">
                        {dayEvents.map((event) => (
                          <span
                            key={event.title}
                            className={cn('size-1.5 rounded-full', event.color)}
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
                  {selectedDay}
                </strong>
                <p className="text-muted-foreground mt-1 text-xs">
                  September 2026
                </p>
              </div>
              <Badge variant="secondary">
                {selectedEvents.length}{' '}
                {selectedEvents.length === 1 ? 'event' : 'events'}
              </Badge>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Day schedule</h3>
              <Clock3 className="text-muted-foreground size-4" />
            </div>
            <div className="mt-4 space-y-3">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event) => (
                  <article
                    key={event.title}
                    className="border-border/70 flex gap-3 rounded-lg border p-3"
                  >
                    <span
                      className={cn(
                        'mt-1 h-9 w-1 shrink-0 rounded-full',
                        event.color,
                      )}
                    />
                    <div>
                      <time className="text-muted-foreground text-[10px]">
                        {event.time}
                      </time>
                      <h4 className="mt-0.5 text-xs font-semibold">
                        {event.title}
                      </h4>
                      <p className="text-muted-foreground mt-1 text-[10px]">
                        {event.subject}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="py-8 text-center">
                  <CalendarDays className="text-muted-foreground mx-auto size-5" />
                  <p className="text-muted-foreground mt-3 text-xs">
                    No example events for this day.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-primary text-primary-foreground border-0 p-5">
            <p className="text-xs text-white/60">Study balance</p>
            <strong className="mt-2 block font-serif text-2xl font-medium">
              A thoughtful week
            </strong>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Your example schedule leaves three open focus blocks.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
