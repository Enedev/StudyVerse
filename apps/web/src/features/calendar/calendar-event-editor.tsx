import { LoaderCircle, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { CalendarEvent } from './calendar-types';
import {
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useUpdateCalendarEventMutation,
} from './use-calendar';

type CalendarEventEditorProps = {
  event: CalendarEvent | null;
  selectedDate: Date;
  onClose: () => void;
};

function toLocalDateTime(date: Date | string) {
  const value = new Date(date);
  const local = new Date(
    value.getTime() - value.getTimezoneOffset() * 60_000,
  );
  return local.toISOString().slice(0, 16);
}

function defaultStart(selectedDate: Date) {
  const start = new Date(selectedDate);
  start.setHours(9, 0, 0, 0);
  return start;
}

export function CalendarEventEditor({
  event,
  selectedDate,
  onClose,
}: CalendarEventEditorProps) {
  const initialStart = event
    ? new Date(event.startsAt)
    : defaultStart(selectedDate);
  const initialEnd = event
    ? new Date(event.endsAt)
    : new Date(initialStart.getTime() + 60 * 60 * 1000);
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [subject, setSubject] = useState(event?.subject ?? '');
  const [startsAt, setStartsAt] = useState(toLocalDateTime(initialStart));
  const [endsAt, setEndsAt] = useState(toLocalDateTime(initialEnd));
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay ?? false);
  const [color, setColor] = useState(event?.color ?? '#557387');
  const createEvent = useCreateCalendarEventMutation();
  const updateEvent = useUpdateCalendarEventMutation();
  const deleteEvent = useDeleteCalendarEventMutation();
  const isSaving = createEvent.isPending || updateEvent.isPending;

  const submit = async (formEvent: FormEvent) => {
    formEvent.preventDefault();
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (end <= start) {
      toast.error('The event must end after it starts.');
      return;
    }

    const input = {
      title,
      description,
      subject,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      isAllDay,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      color,
    };

    try {
      if (event) {
        await updateEvent.mutateAsync({ eventId: event.id, input });
        toast.success('Event updated.');
      } else {
        await createEvent.mutateAsync(input);
        toast.success('Event created.');
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save.');
    }
  };

  const remove = async () => {
    if (!event || !window.confirm(`Delete "${event.title}"?`)) return;
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success('Event deleted.');
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete.',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close event editor"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-editor-title"
        className="bg-background absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-muted-foreground text-xs">
              {event ? 'Edit event' : 'New event'}
            </p>
            <h2 id="event-editor-title" className="font-serif text-2xl">
              {event ? event.title : 'Shape your schedule'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        <form
          className="min-h-0 flex-1 overflow-y-auto p-5"
          onSubmit={(formEvent) => void submit(formEvent)}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Title</Label>
              <Input
                id="eventTitle"
                value={title}
                onChange={(inputEvent) => setTitle(inputEvent.target.value)}
                maxLength={240}
                placeholder="Study session, class, or deadline"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDescription">Description</Label>
              <textarea
                id="eventDescription"
                value={description}
                onChange={(inputEvent) =>
                  setDescription(inputEvent.target.value)
                }
                rows={4}
                placeholder="Add useful context."
                className="border-input bg-background/70 focus-visible:border-ring focus-visible:ring-ring/25 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventStart">Starts</Label>
                <Input
                  id="eventStart"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(inputEvent) =>
                    setStartsAt(inputEvent.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventEnd">Ends</Label>
                <Input
                  id="eventEnd"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(inputEvent) => setEndsAt(inputEvent.target.value)}
                  required
                />
              </div>
            </div>

            <label className="bg-muted/40 flex items-center gap-3 rounded-lg p-3 text-sm">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(inputEvent) =>
                  setIsAllDay(inputEvent.target.checked)
                }
                className="accent-primary size-4"
              />
              All-day event
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="eventSubject">Subject</Label>
                <Input
                  id="eventSubject"
                  value={subject}
                  onChange={(inputEvent) => setSubject(inputEvent.target.value)}
                  maxLength={100}
                  placeholder="Biology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventColor">Color</Label>
                <Input
                  id="eventColor"
                  type="color"
                  value={color}
                  onChange={(inputEvent) => setColor(inputEvent.target.value)}
                  className="w-full cursor-pointer px-1 sm:w-16"
                />
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between border-t pt-5">
            <div>
              {event && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => void remove()}
                  disabled={deleteEvent.isPending}
                >
                  <Trash2 />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !title.trim()}>
                {isSaving && <LoaderCircle className="animate-spin" />}
                {event ? 'Save changes' : 'Create event'}
              </Button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
