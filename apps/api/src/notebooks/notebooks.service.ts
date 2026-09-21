import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseService } from '../database/supabase.service.js';
import { CreateNotebookDto, UpdateNotebookDto } from './dto/notebook.dto.js';

type NotebookRow = {
  id: string;
  title: string;
  paper_type: 'blank' | 'lined' | 'grid' | 'dotted';
  pages: unknown;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class NotebooksService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(user: AuthenticatedUser) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('notebooks')
      .select('id, title, paper_type, pages, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException('Unable to load notebooks.');
    }

    return (data as NotebookRow[]).map((notebook) =>
      this.mapSummary(notebook),
    );
  }

  async get(user: AuthenticatedUser, notebookId: string) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('notebooks')
      .select('id, title, paper_type, pages, created_at, updated_at')
      .eq('id', notebookId)
      .maybeSingle<NotebookRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to load the notebook.');
    }
    if (!data) throw new NotFoundException('Notebook not found.');

    return this.mapDetail(data);
  }

  async create(user: AuthenticatedUser, dto: CreateNotebookDto) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('notebooks')
      .insert({
        user_id: user.id,
        title: dto.title.trim(),
        paper_type: dto.paperType ?? 'lined',
        pages: [
          {
            id: crypto.randomUUID(),
            mode: 'write',
            text: '',
            scene: null,
          },
        ],
      })
      .select('id, title, paper_type, pages, created_at, updated_at')
      .single<NotebookRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to create the notebook.');
    }

    return this.mapDetail(data);
  }

  async update(
    user: AuthenticatedUser,
    notebookId: string,
    dto: UpdateNotebookDto,
  ) {
    const updates: Record<string, unknown> = {};
    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.paperType !== undefined) updates.paper_type = dto.paperType;
    if (dto.pages !== undefined) updates.pages = dto.pages;

    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('notebooks')
      .update(updates)
      .eq('id', notebookId)
      .select('id, title, paper_type, pages, created_at, updated_at')
      .maybeSingle<NotebookRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to save the notebook.');
    }
    if (!data) throw new NotFoundException('Notebook not found.');

    return this.mapDetail(data);
  }

  async remove(user: AuthenticatedUser, notebookId: string) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('notebooks')
      .delete()
      .eq('id', notebookId)
      .select('id')
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new InternalServerErrorException('Unable to delete the notebook.');
    }
    if (!data) throw new NotFoundException('Notebook not found.');

    return { id: data.id };
  }

  private mapSummary(notebook: NotebookRow) {
    return {
      id: notebook.id,
      title: notebook.title,
      paperType: notebook.paper_type,
      pageCount: Array.isArray(notebook.pages) ? notebook.pages.length : 0,
      createdAt: notebook.created_at,
      updatedAt: notebook.updated_at,
    };
  }

  private mapDetail(notebook: NotebookRow) {
    return {
      ...this.mapSummary(notebook),
      pages: Array.isArray(notebook.pages) ? notebook.pages : [],
    };
  }
}
