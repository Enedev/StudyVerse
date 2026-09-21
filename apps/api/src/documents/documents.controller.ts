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
  AnnotationParamsDto,
  CreateAnnotationDto,
  CreateDocumentDto,
  DocumentParamsDto,
  UpdateDocumentDto,
} from './dto/document.dto.js';
import { DocumentsService } from './documents.service.js';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List owned documents' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.list(user);
  }

  @Get(':documentId')
  @ApiOperation({ summary: 'Get one owned document' })
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: DocumentParamsDto,
  ) {
    return this.documentsService.get(user, params.documentId);
  }

  @Post()
  @ApiOperation({ summary: 'Save metadata for an uploaded PDF' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.create(user, dto);
  }

  @Patch(':documentId')
  @ApiOperation({ summary: 'Update document details or reading position' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: DocumentParamsDto,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(user, params.documentId, dto);
  }

  @Delete(':documentId')
  @ApiOperation({ summary: 'Delete an owned document and its file' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: DocumentParamsDto,
  ) {
    return this.documentsService.remove(user, params.documentId);
  }

  @Get(':documentId/annotations')
  @ApiOperation({ summary: 'List annotations for an owned document' })
  listAnnotations(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: DocumentParamsDto,
  ) {
    return this.documentsService.listAnnotations(user, params.documentId);
  }

  @Post(':documentId/annotations')
  @ApiOperation({ summary: 'Add a note or bookmark' })
  addAnnotation(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: DocumentParamsDto,
    @Body() dto: CreateAnnotationDto,
  ) {
    return this.documentsService.addAnnotation(user, params.documentId, dto);
  }

  @Delete(':documentId/annotations/:annotationId')
  @ApiOperation({ summary: 'Delete an annotation' })
  removeAnnotation(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: AnnotationParamsDto,
  ) {
    return this.documentsService.removeAnnotation(
      user,
      params.documentId,
      params.annotationId,
    );
  }
}
