import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseService } from '../database/supabase.service.js';
import {
  CreateWhiteboardDto,
  InviteWhiteboardMemberDto,
  UpdateWhiteboardDto,
} from './dto/whiteboard.dto.js';

type MemberRow = {
  user_id: string;
  role: 'viewer' | 'editor';
  created_at: string;
};

type WhiteboardRow = {
  id: string;
  owner_id: string;
  title: string;
  snapshot?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  whiteboard_members?: MemberRow[];
};

@Injectable()
export class WhiteboardsService {
  private readonly logger = new Logger(WhiteboardsService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async list(user: AuthenticatedUser) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('whiteboards')
      .select(
        'id, owner_id, title, created_at, updated_at, whiteboard_members(user_id, role, created_at)',
      )
      .order('updated_at', { ascending: false });

    if (error) {
      this.logger.error(`List failed: ${error.code ?? ''} ${error.message}`);
      throw new InternalServerErrorException('Unable to load whiteboards.');
    }

    return (data as WhiteboardRow[]).map((board) =>
      this.mapSummary(board, user.id),
    );
  }

  async get(user: AuthenticatedUser, whiteboardId: string) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('whiteboards')
      .select(
        'id, owner_id, title, snapshot, created_at, updated_at, whiteboard_members(user_id, role, created_at)',
      )
      .eq('id', whiteboardId)
      .maybeSingle<WhiteboardRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to load the whiteboard.');
    }
    if (!data) throw new NotFoundException('Whiteboard not found.');

    return this.mapDetail(data, user.id);
  }

  async create(user: AuthenticatedUser, dto: CreateWhiteboardDto) {
    const client = this.supabase.forUser(user.accessToken);
    const whiteboardId = crypto.randomUUID();
    const { error } = await client.from('whiteboards').insert({
      id: whiteboardId,
      owner_id: user.id,
      title: dto.title.trim(),
      snapshot: {},
    });

    if (error) {
      this.logger.error(`Create failed: ${error.code ?? ''} ${error.message}`);
      throw new InternalServerErrorException('Unable to create the whiteboard.');
    }

    return this.get(user, whiteboardId);
  }

  async update(
    user: AuthenticatedUser,
    whiteboardId: string,
    dto: UpdateWhiteboardDto,
  ) {
    const current = await this.get(user, whiteboardId);
    if (current.role === 'viewer') {
      throw new ForbiddenException('Viewers cannot edit this whiteboard.');
    }
    if (dto.title !== undefined && current.role !== 'owner') {
      throw new ForbiddenException('Only the owner can rename this whiteboard.');
    }

    const updates: Record<string, unknown> = {};
    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.snapshot !== undefined) updates.snapshot = dto.snapshot;

    const client = this.supabase.forUser(user.accessToken);
    const { error } = await client
      .from('whiteboards')
      .update(updates)
      .eq('id', whiteboardId);

    if (error) {
      throw new InternalServerErrorException('Unable to save the whiteboard.');
    }

    if (dto.snapshot !== undefined && dto.title === undefined) {
      return { id: whiteboardId, saved: true };
    }

    return this.get(user, whiteboardId);
  }

  async remove(user: AuthenticatedUser, whiteboardId: string) {
    const current = await this.get(user, whiteboardId);
    if (current.role !== 'owner') {
      throw new ForbiddenException('Only the owner can delete this whiteboard.');
    }

    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('whiteboards')
      .delete()
      .eq('id', whiteboardId)
      .select('id')
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new InternalServerErrorException('Unable to delete the whiteboard.');
    }
    if (!data) throw new NotFoundException('Whiteboard not found.');

    return { id: data.id };
  }

  async invite(
    user: AuthenticatedUser,
    whiteboardId: string,
    dto: InviteWhiteboardMemberDto,
  ) {
    const current = await this.get(user, whiteboardId);
    if (current.role !== 'owner') {
      throw new ForbiddenException('Only the owner can invite collaborators.');
    }

    const { data: memberId, error: lookupError } = await this.supabase.admin.rpc(
      'find_user_id_by_email',
      { target_email: dto.email },
    );

    if (lookupError) {
      throw new InternalServerErrorException('Unable to look up that account.');
    }
    if (!memberId || typeof memberId !== 'string') {
      throw new NotFoundException('No StudyVerse account uses that email.');
    }
    if (memberId === user.id) {
      throw new BadRequestException('You already own this whiteboard.');
    }

    const client = this.supabase.forUser(user.accessToken);
    const { error } = await client.from('whiteboard_members').upsert(
      {
        whiteboard_id: whiteboardId,
        user_id: memberId,
        role: dto.role,
        invited_by: user.id,
      },
      { onConflict: 'whiteboard_id,user_id' },
    );

    if (error) {
      throw new InternalServerErrorException('Unable to invite that collaborator.');
    }

    return this.get(user, whiteboardId);
  }

  async removeMember(
    user: AuthenticatedUser,
    whiteboardId: string,
    memberId: string,
  ) {
    const current = await this.get(user, whiteboardId);
    if (current.role !== 'owner') {
      throw new ForbiddenException('Only the owner can remove collaborators.');
    }

    const client = this.supabase.forUser(user.accessToken);
    const { error } = await client
      .from('whiteboard_members')
      .delete()
      .eq('whiteboard_id', whiteboardId)
      .eq('user_id', memberId);

    if (error) {
      throw new InternalServerErrorException('Unable to remove the collaborator.');
    }

    return this.get(user, whiteboardId);
  }

  private mapSummary(board: WhiteboardRow, userId: string) {
    return {
      id: board.id,
      title: board.title,
      role: this.roleFor(board, userId),
      memberCount: board.whiteboard_members?.length ?? 0,
      createdAt: board.created_at,
      updatedAt: board.updated_at,
    };
  }

  private mapDetail(board: WhiteboardRow, userId: string) {
    const role = this.roleFor(board, userId);
    return {
      ...this.mapSummary(board, userId),
      snapshot: board.snapshot ?? {},
      members:
        role === 'owner'
          ? (board.whiteboard_members ?? []).map((member) => ({
              userId: member.user_id,
              role: member.role,
              createdAt: member.created_at,
            }))
          : [],
    };
  }

  private roleFor(board: WhiteboardRow, userId: string) {
    if (board.owner_id === userId) return 'owner' as const;
    return (
      board.whiteboard_members?.find((member) => member.user_id === userId)
        ?.role ?? 'viewer'
    );
  }
}
