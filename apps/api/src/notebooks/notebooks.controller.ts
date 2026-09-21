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
  CreateNotebookDto,
  NotebookParamsDto,
  UpdateNotebookDto,
} from './dto/notebook.dto.js';
import { NotebooksService } from './notebooks.service.js';

@ApiTags('notebooks')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('notebooks')
export class NotebooksController {
  constructor(private readonly notebooksService: NotebooksService) {}

  @Get()
  @ApiOperation({ summary: 'List owned notebooks' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.notebooksService.list(user);
  }

  @Get(':notebookId')
  @ApiOperation({ summary: 'Get one notebook and its pages' })
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: NotebookParamsDto,
  ) {
    return this.notebooksService.get(user, params.notebookId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a notebook' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateNotebookDto,
  ) {
    return this.notebooksService.create(user, dto);
  }

  @Patch(':notebookId')
  @ApiOperation({ summary: 'Update notebook paper, title, or pages' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: NotebookParamsDto,
    @Body() dto: UpdateNotebookDto,
  ) {
    return this.notebooksService.update(user, params.notebookId, dto);
  }

  @Delete(':notebookId')
  @ApiOperation({ summary: 'Delete an owned notebook' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: NotebookParamsDto,
  ) {
    return this.notebooksService.remove(user, params.notebookId);
  }
}
