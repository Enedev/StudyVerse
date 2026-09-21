import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseService } from '../database/supabase.service.js';
import {
  CreateCalendarEventDto,
  ListCalendarEventsQueryDto,
  UpdateCalendarEventDto,
} from './dto/calendar-event.dto.js';

type CalendarEventRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  is_all_day: boolean;
  timezone: string;
  recurrence_rule: string | null;
  subject: string | null;
  color: string | null;
  source_task_id: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class CalendarService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(
    user: AuthenticatedUser,
    query: ListCalendarEventsQueryDto,
  ) {
    this.assertDateRange(query.from, query.to);
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('calendar_events')
      .select(
        'id, user_id, title, description, starts_at, ends_at, is_all_day, timezone, recurrence_rule, subject, color, source_task_id, created_at, updated_at',
      )
      .lt('starts_at', query.to)
      .gt('ends_at', query.from)
      .order('starts_at', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to load calendar events.',
      );
    }

    return (data as CalendarEventRow[]).map((event) => this.mapEvent(event));
  }

  async get(user: AuthenticatedUser, eventId: string) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('calendar_events')
      .select(
        'id, user_id, title, description, starts_at, ends_at, is_all_day, timezone, recurrence_rule, subject, color, source_task_id, created_at, updated_at',
      )
      .eq('id', eventId)
      .maybeSingle<CalendarEventRow>();

    if (error) {
      throw new InternalServerErrorException(
        'Unable to load the calendar event.',
      );
    }
    if (!data) throw new NotFoundException('Calendar event not found.');

    return data;
  }

  async create(user: AuthenticatedUser, dto: CreateCalendarEventDto) {
    this.assertDateRange(dto.startsAt, dto.endsAt);
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        starts_at: dto.startsAt,
        ends_at: dto.endsAt,
        is_all_day: dto.isAllDay ?? false,
        timezone: dto.timezone ?? 'UTC',
        recurrence_rule: dto.recurrenceRule?.trim() || null,
        subject: dto.subject?.trim() || null,
        color: dto.color ?? null,
        source_task_id: dto.sourceTaskId ?? null,
      })
      .select(
        'id, user_id, title, description, starts_at, ends_at, is_all_day, timezone, recurrence_rule, subject, color, source_task_id, created_at, updated_at',
      )
      .single<CalendarEventRow>();

    if (error) {
      throw new InternalServerErrorException(
        'Unable to create the calendar event.',
      );
    }

    return this.mapEvent(data);
  }

  async update(
    user: AuthenticatedUser,
    eventId: string,
    dto: UpdateCalendarEventDto,
  ) {
    const current = await this.get(user, eventId);
    const startsAt = dto.startsAt ?? current.starts_at;
    const endsAt = dto.endsAt ?? current.ends_at;
    this.assertDateRange(startsAt, endsAt);

    const updates: Record<string, unknown> = {};
    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.description !== undefined) {
      updates.description = dto.description.trim() || null;
    }
    if (dto.startsAt !== undefined) updates.starts_at = dto.startsAt;
    if (dto.endsAt !== undefined) updates.ends_at = dto.endsAt;
    if (dto.isAllDay !== undefined) updates.is_all_day = dto.isAllDay;
    if (dto.timezone !== undefined) updates.timezone = dto.timezone;
    if (dto.recurrenceRule !== undefined) {
      updates.recurrence_rule = dto.recurrenceRule.trim() || null;
    }
    if (dto.subject !== undefined) {
      updates.subject = dto.subject.trim() || null;
    }
    if (dto.color !== undefined) updates.color = dto.color || null;
    if (dto.sourceTaskId !== undefined) {
      updates.source_task_id = dto.sourceTaskId || null;
    }

    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .select(
        'id, user_id, title, description, starts_at, ends_at, is_all_day, timezone, recurrence_rule, subject, color, source_task_id, created_at, updated_at',
      )
      .maybeSingle<CalendarEventRow>();

    if (error) {
      throw new InternalServerErrorException(
        'Unable to update the calendar event.',
      );
    }
    if (!data) throw new NotFoundException('Calendar event not found.');

    return this.mapEvent(data);
  }

  async remove(user: AuthenticatedUser, eventId: string) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .select('id')
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new InternalServerErrorException(
        'Unable to delete the calendar event.',
      );
    }
    if (!data) throw new NotFoundException('Calendar event not found.');

    return { id: data.id };
  }

  private assertDateRange(startsAt: string, endsAt: string) {
    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      throw new BadRequestException('Event end must be after its start.');
    }
  }

  private mapEvent(event: CalendarEventRow) {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      isAllDay: event.is_all_day,
      timezone: event.timezone,
      recurrenceRule: event.recurrence_rule,
      subject: event.subject,
      color: event.color,
      sourceTaskId: event.source_task_id,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    };
  }
}
