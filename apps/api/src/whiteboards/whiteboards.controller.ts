import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  CreateWhiteboardDto,
  InviteWhiteboardMemberDto,
  UpdateWhiteboardDto,
  WhiteboardMemberParamsDto,
  WhiteboardParamsDto,
} from './dto/whiteboard.dto.js';
import { WhiteboardsService } from './whiteboards.service.js';

@ApiTags('whiteboards')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('whiteboards')
export class WhiteboardsController {
  constructor(private readonly whiteboardsService: WhiteboardsService) {}

  @Get()
  @ApiOperation({ summary: 'List accessible whiteboards' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.whiteboardsService.list(user);
  }

  @Get(':whiteboardId')
  @ApiOperation({ summary: 'Get a whiteboard and its saved canvas' })
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: WhiteboardParamsDto,
  ) {
    return this.whiteboardsService.get(user, params.whiteboardId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a whiteboard' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWhiteboardDto,
  ) {
    return this.whiteboardsService.create(user, dto);
  }

  @Patch(':whiteboardId')
  @ApiOperation({ summary: 'Rename a whiteboard or save its canvas' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: WhiteboardParamsDto,
    @Body() dto: UpdateWhiteboardDto,
  ) {
    return this.whiteboardsService.update(user, params.whiteboardId, dto);
  }

  @Delete(':whiteboardId')
  @ApiOperation({ summary: 'Delete an owned whiteboard' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: WhiteboardParamsDto,
  ) {
    return this.whiteboardsService.remove(user, params.whiteboardId);
  }

  @Post(':whiteboardId/members')
  @ApiOperation({ summary: 'Invite a collaborator by email' })
  invite(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: WhiteboardParamsDto,
    @Body() dto: InviteWhiteboardMemberDto,
  ) {
    return this.whiteboardsService.invite(user, params.whiteboardId, dto);
  }

  @Delete(':whiteboardId/members/:memberId')
  @ApiOperation({ summary: 'Remove a collaborator' })
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: WhiteboardMemberParamsDto,
  ) {
    return this.whiteboardsService.removeMember(
      user,
      params.whiteboardId,
      params.memberId,
    );
  }
}
