import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CalendarService } from './calendar.service.js';
import {
  CalendarEventParamsDto,
  CreateCalendarEventDto,
  ListCalendarEventsQueryDto,
  UpdateCalendarEventDto,
} from './dto/calendar-event.dto.js';

@ApiTags('calendar')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('calendar/events')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'List owned calendar events in a date range' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCalendarEventsQueryDto,
  ) {
    return this.calendarService.list(user, query);
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Get one owned calendar event' })
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: CalendarEventParamsDto,
  ) {
    const event = await this.calendarService.get(user, params.eventId);
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

  @Post()
  @ApiCreatedResponse({ description: 'The calendar event was created.' })
  @ApiOperation({ summary: 'Create a calendar event' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCalendarEventDto,
  ) {
    return this.calendarService.create(user, dto);
  }

  @Patch(':eventId')
  @ApiOperation({ summary: 'Update an owned calendar event' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: CalendarEventParamsDto,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.calendarService.update(user, params.eventId, dto);
  }

  @Delete(':eventId')
  @ApiOperation({ summary: 'Delete an owned calendar event' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: CalendarEventParamsDto,
  ) {
    return this.calendarService.remove(user, params.eventId);
  }
}
