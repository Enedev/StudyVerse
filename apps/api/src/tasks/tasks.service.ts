import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseService } from '../database/supabase.service.js';
import {
  CreateSubtaskDto,
  CreateTaskDto,
  ListTasksQueryDto,
  TaskStatus,
  UpdateSubtaskDto,
  UpdateTaskDto,
} from './dto/task.dto.js';

type SubtaskRow = {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  subject: string | null;
  tags: string[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  task_subtasks?: SubtaskRow[];
};

@Injectable()
export class TasksService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(user: AuthenticatedUser, query: ListTasksQueryDto) {
    const client = this.supabase.forUser(user.accessToken);
    let request = client
      .from('tasks')
      .select(
        'id, user_id, title, description, status, priority, due_at, subject, tags, completed_at, created_at, updated_at, task_subtasks(id, task_id, title, is_completed, position, created_at, updated_at)',
      )
      .order('created_at', { ascending: false })
      .order('position', {
        referencedTable: 'task_subtasks',
        ascending: true,
      });

    if (query.status) request = request.eq('status', query.status);
    if (query.dueFrom) request = request.gte('due_at', query.dueFrom);
    if (query.dueTo) request = request.lte('due_at', query.dueTo);
    if (query.search) request = request.ilike('title', `%${query.search}%`);

    const { data, error } = await request;
    if (error) {
      throw new InternalServerErrorException('Unable to load tasks.');
    }

    return (data as TaskRow[]).map((task) => this.mapTask(task));
  }

  async get(user: AuthenticatedUser, taskId: string) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('tasks')
      .select(
        'id, user_id, title, description, status, priority, due_at, subject, tags, completed_at, created_at, updated_at, task_subtasks(id, task_id, title, is_completed, position, created_at, updated_at)',
      )
      .eq('id', taskId)
      .order('position', {
        referencedTable: 'task_subtasks',
        ascending: true,
      })
      .maybeSingle<TaskRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to load the task.');
    }
    if (!data) throw new NotFoundException('Task not found.');

    return this.mapTask(data);
  }

  async create(user: AuthenticatedUser, dto: CreateTaskDto) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('tasks')
      .insert({
        user_id: user.id,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        status: dto.status ?? 'todo',
        priority: dto.priority ?? 'medium',
        due_at: dto.dueAt ?? null,
        subject: dto.subject?.trim() || null,
        tags: dto.tags ?? [],
        completed_at:
          dto.status === TaskStatus.Completed ? new Date().toISOString() : null,
      })
      .select(
        'id, user_id, title, description, status, priority, due_at, subject, tags, completed_at, created_at, updated_at',
      )
      .single<TaskRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to create the task.');
    }

    return this.mapTask({ ...data, task_subtasks: [] });
  }

  async update(
    user: AuthenticatedUser,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    const updates: Record<string, unknown> = {};
    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.description !== undefined) {
      updates.description = dto.description.trim() || null;
    }
    if (dto.status !== undefined) {
      updates.status = dto.status;
      updates.completed_at =
        dto.status === TaskStatus.Completed ? new Date().toISOString() : null;
    }
    if (dto.priority !== undefined) updates.priority = dto.priority;
    if (dto.dueAt !== undefined) updates.due_at = dto.dueAt || null;
    if (dto.subject !== undefined) {
      updates.subject = dto.subject.trim() || null;
    }
    if (dto.tags !== undefined) updates.tags = dto.tags;

    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select(
        'id, user_id, title, description, status, priority, due_at, subject, tags, completed_at, created_at, updated_at, task_subtasks(id, task_id, title, is_completed, position, created_at, updated_at)',
      )
      .maybeSingle<TaskRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to update the task.');
    }
    if (!data) throw new NotFoundException('Task not found.');

    return this.mapTask(data);
  }

  async remove(user: AuthenticatedUser, taskId: string) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .select('id')
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new InternalServerErrorException('Unable to delete the task.');
    }
    if (!data) throw new NotFoundException('Task not found.');

    return { id: data.id };
  }

  async addSubtask(
    user: AuthenticatedUser,
    taskId: string,
    dto: CreateSubtaskDto,
  ) {
    await this.get(user, taskId);
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('task_subtasks')
      .insert({
        task_id: taskId,
        title: dto.title.trim(),
        position: dto.position ?? 0,
      })
      .select(
        'id, task_id, title, is_completed, position, created_at, updated_at',
      )
      .single<SubtaskRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to create the subtask.');
    }

    return this.mapSubtask(data);
  }

  async updateSubtask(
    user: AuthenticatedUser,
    taskId: string,
    subtaskId: string,
    dto: UpdateSubtaskDto,
  ) {
    await this.get(user, taskId);
    const updates: Record<string, unknown> = {};
    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.position !== undefined) updates.position = dto.position;
    if (dto.isCompleted !== undefined) {
      updates.is_completed = dto.isCompleted;
    }

    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('task_subtasks')
      .update(updates)
      .eq('id', subtaskId)
      .eq('task_id', taskId)
      .select(
        'id, task_id, title, is_completed, position, created_at, updated_at',
      )
      .maybeSingle<SubtaskRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to update the subtask.');
    }
    if (!data) throw new NotFoundException('Subtask not found.');

    return this.mapSubtask(data);
  }

  async removeSubtask(
    user: AuthenticatedUser,
    taskId: string,
    subtaskId: string,
  ) {
    await this.get(user, taskId);
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('task_subtasks')
      .delete()
      .eq('id', subtaskId)
      .eq('task_id', taskId)
      .select('id')
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new InternalServerErrorException('Unable to delete the subtask.');
    }
    if (!data) throw new NotFoundException('Subtask not found.');

    return { id: data.id };
  }

  private mapTask(task: TaskRow) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueAt: task.due_at,
      subject: task.subject,
      tags: task.tags,
      completedAt: task.completed_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      subtasks: (task.task_subtasks ?? []).map((subtask) =>
        this.mapSubtask(subtask),
      ),
    };
  }

  private mapSubtask(subtask: SubtaskRow) {
    return {
      id: subtask.id,
      taskId: subtask.task_id,
      title: subtask.title,
      isCompleted: subtask.is_completed,
      position: subtask.position,
      createdAt: subtask.created_at,
      updatedAt: subtask.updated_at,
    };
  }
}
