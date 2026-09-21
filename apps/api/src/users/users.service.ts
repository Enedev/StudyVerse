import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseService } from '../database/supabase.service.js';

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async getOwnProfile(user: AuthenticatedUser) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('profiles')
      .select(
        'id, display_name, avatar_url, timezone, created_at, updated_at',
      )
      .eq('id', user.id)
      .maybeSingle<ProfileRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to load the profile.');
    }

    if (!data) {
      throw new NotFoundException('Profile not found.');
    }

    return {
      id: data.id,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      timezone: data.timezone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
