import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsHexColor,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateCalendarEventDto {
  @IsString()
  @Length(1, 240)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  recurrenceRule?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subject?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsUUID()
  sourceTaskId?: string;
}

export class UpdateCalendarEventDto extends PartialType(
  CreateCalendarEventDto,
) {}

export class ListCalendarEventsQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}

export class CalendarEventParamsDto {
  @IsUUID()
  eventId: string;
}
