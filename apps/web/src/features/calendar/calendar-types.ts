export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  timezone: string;
  recurrenceRule: string | null;
  subject: string | null;
  color: string | null;
  sourceTaskId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SaveCalendarEventInput = {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  isAllDay?: boolean;
  timezone?: string;
  subject?: string;
  color?: string;
};
