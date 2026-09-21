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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  BookParamsDto,
  CreateBookDto,
  ListBooksQueryDto,
  UpdateBookDto,
} from './dto/library.dto.js';
import { LibraryService } from './library.service.js';

@ApiTags('library')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('books')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @ApiOperation({ summary: 'List owned books' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListBooksQueryDto,
  ) {
    return this.libraryService.list(user, query);
  }

  @Get(':bookId')
  @ApiOperation({ summary: 'Get one owned book' })
  get(@CurrentUser() user: AuthenticatedUser, @Param() params: BookParamsDto) {
    return this.libraryService.get(user, params.bookId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a book' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBookDto) {
    return this.libraryService.create(user, dto);
  }

  @Patch(':bookId')
  @ApiOperation({ summary: 'Update book metadata or reading progress' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: BookParamsDto,
    @Body() dto: UpdateBookDto,
  ) {
    return this.libraryService.update(user, params.bookId, dto);
  }

  @Delete(':bookId')
  @ApiOperation({ summary: 'Delete an owned book' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: BookParamsDto,
  ) {
    return this.libraryService.remove(user, params.bookId);
  }

  @Post(':bookId/favorite')
  @ApiOperation({ summary: 'Mark a book as a favorite' })
  favorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: BookParamsDto,
  ) {
    return this.libraryService.setFavorite(user, params.bookId, true);
  }

  @Delete(':bookId/favorite')
  @ApiOperation({ summary: 'Remove a book from favorites' })
  unfavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: BookParamsDto,
  ) {
    return this.libraryService.setFavorite(user, params.bookId, false);
  }
}
