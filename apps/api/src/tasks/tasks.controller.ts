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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  CreateSubtaskDto,
  CreateTaskDto,
  ListTasksQueryDto,
  SubtaskIdParamsDto,
  TaskIdParamsDto,
  UpdateSubtaskDto,
  UpdateTaskDto,
} from './dto/task.dto.js';
import { TasksService } from './tasks.service.js';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks owned by the current user' })
  @ApiOkResponse({ description: 'The current user tasks.' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListTasksQueryDto,
  ) {
    return this.tasksService.list(user, query);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get one owned task' })
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: TaskIdParamsDto,
  ) {
    return this.tasksService.get(user, params.taskId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiCreatedResponse({ description: 'The task was created.' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(user, dto);
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Update an owned task' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: TaskIdParamsDto,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user, params.taskId, dto);
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete an owned task' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: TaskIdParamsDto,
  ) {
    return this.tasksService.remove(user, params.taskId);
  }

  @Post(':taskId/subtasks')
  @ApiOperation({ summary: 'Create a subtask on an owned task' })
  addSubtask(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: TaskIdParamsDto,
    @Body() dto: CreateSubtaskDto,
  ) {
    return this.tasksService.addSubtask(user, params.taskId, dto);
  }

  @Patch(':taskId/subtasks/:subtaskId')
  @ApiOperation({ summary: 'Update a subtask on an owned task' })
  updateSubtask(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: SubtaskIdParamsDto,
    @Body() dto: UpdateSubtaskDto,
  ) {
    return this.tasksService.updateSubtask(
      user,
      params.taskId,
      params.subtaskId,
      dto,
    );
  }

  @Delete(':taskId/subtasks/:subtaskId')
  @ApiOperation({ summary: 'Delete a subtask from an owned task' })
  removeSubtask(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: SubtaskIdParamsDto,
  ) {
    return this.tasksService.removeSubtask(
      user,
      params.taskId,
      params.subtaskId,
    );
  }
}
