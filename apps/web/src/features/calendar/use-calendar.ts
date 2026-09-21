import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent,
} from './calendar-api';
import type { SaveCalendarEventInput } from './calendar-types';

const calendarKey = ['calendar-events'] as const;

export function useCalendarEventsQuery(from: string, to: string) {
  return useQuery({
    queryKey: [...calendarKey, from, to],
    queryFn: () => listCalendarEvents(from, to),
  });
}

function useRefreshCalendar() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: calendarKey });
}

export function useCreateCalendarEventMutation() {
  const refresh = useRefreshCalendar();
  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: refresh,
  });
}

export function useUpdateCalendarEventMutation() {
  const refresh = useRefreshCalendar();
  return useMutation({
    mutationFn: ({
      eventId,
      input,
    }: {
      eventId: string;
      input: Partial<SaveCalendarEventInput>;
    }) => updateCalendarEvent(eventId, input),
    onSuccess: refresh,
  });
}

export function useDeleteCalendarEventMutation() {
  const refresh = useRefreshCalendar();
  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: refresh,
  });
}
