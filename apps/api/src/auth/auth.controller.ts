import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { SupabaseService } from '../database/supabase.service.js';
import { RegisterAccountDto } from './dto/register-account.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Create a confirmed account without sending a confirmation email',
  })
  async register(@Body() dto: RegisterAccountDto) {
    const { data, error } = await this.supabase.admin.auth.admin.createUser({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
      email_confirm: true,
      user_metadata: { display_name: dto.displayName.trim() },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes('already') ||
        message.includes('registered') ||
        error.status === 422
      ) {
        throw new ConflictException(
          'An account with that email already exists. Sign in instead.',
        );
      }
      throw new BadRequestException(error.message);
    }

    return { id: data.user?.id };
  }
}
