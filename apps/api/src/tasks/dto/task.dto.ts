import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Completed = 'completed',
  Archived = 'archived',
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent',
}

export class CreateTaskDto {
  @IsString()
  @Length(1, 240)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsDateString()
  dueAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subject?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class ListTasksQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueFrom?: string;

  @IsOptional()
  @IsDateString()
  dueTo?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
  search?: string;
}

export class CreateSubtaskDto {
  @IsString()
  @Length(1, 240)
  title: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateSubtaskDto extends PartialType(CreateSubtaskDto) {
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class TaskIdParamsDto {
  @IsUUID()
  taskId: string;
}

export class SubtaskIdParamsDto extends TaskIdParamsDto {
  @IsUUID()
  subtaskId: string;
}
