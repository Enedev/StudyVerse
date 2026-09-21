import { apiFetch } from '@/lib/api/client';

import type {
  CalendarEvent,
  SaveCalendarEventInput,
} from './calendar-types';

export function listCalendarEvents(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  return apiFetch<CalendarEvent[]>(`/calendar/events?${params}`);
}

export function createCalendarEvent(input: SaveCalendarEventInput) {
  return apiFetch<CalendarEvent>('/calendar/events', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateCalendarEvent(
  eventId: string,
  input: Partial<SaveCalendarEventInput>,
) {
  return apiFetch<CalendarEvent>(`/calendar/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteCalendarEvent(eventId: string) {
  return apiFetch<{ id: string }>(`/calendar/events/${eventId}`, {
    method: 'DELETE',
  });
}
