import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseService } from '../database/supabase.service.js';
import {
  CreateAnnotationDto,
  CreateDocumentDto,
  UpdateDocumentDto,
} from './dto/document.dto.js';

type AnnotationRow = {
  id: string;
  document_id: string;
  annotation_type: string;
  page_number: number;
  geometry: Record<string, unknown> | null;
  content: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

type DocumentRow = {
  id: string;
  title: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  page_count: number | null;
  last_opened_page: number;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class DocumentsService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(user: AuthenticatedUser) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('documents')
      .select(
        'id, title, original_filename, storage_path, mime_type, size_bytes, page_count, last_opened_page, created_at, updated_at',
      )
      .order('updated_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException('Unable to load documents.');
    }

    return (data as DocumentRow[]).map((document) => this.mapDocument(document));
  }

  async get(user: AuthenticatedUser, documentId: string) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('documents')
      .select(
        'id, title, original_filename, storage_path, mime_type, size_bytes, page_count, last_opened_page, created_at, updated_at',
      )
      .eq('id', documentId)
      .maybeSingle<DocumentRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to load the document.');
    }
    if (!data) throw new NotFoundException('Document not found.');

    return this.mapDocument(data);
  }

  async create(user: AuthenticatedUser, dto: CreateDocumentDto) {
    const expectedPrefix = `${user.id}/`;
    if (!dto.storagePath.startsWith(expectedPrefix)) {
      throw new BadRequestException(
        'The uploaded file must be stored in your private folder.',
      );
    }

    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('documents')
      .insert({
        user_id: user.id,
        title: dto.title.trim(),
        original_filename: dto.originalFilename,
        storage_path: dto.storagePath,
        mime_type: 'application/pdf',
        size_bytes: dto.sizeBytes,
        page_count: dto.pageCount ?? null,
      })
      .select(
        'id, title, original_filename, storage_path, mime_type, size_bytes, page_count, last_opened_page, created_at, updated_at',
      )
      .single<DocumentRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to save the document.');
    }

    return this.mapDocument(data);
  }

  async update(
    user: AuthenticatedUser,
    documentId: string,
    dto: UpdateDocumentDto,
  ) {
    const updates: Record<string, unknown> = {};
    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.pageCount !== undefined) updates.page_count = dto.pageCount;
    if (dto.lastOpenedPage !== undefined) {
      updates.last_opened_page = dto.lastOpenedPage;
    }

    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select(
        'id, title, original_filename, storage_path, mime_type, size_bytes, page_count, last_opened_page, created_at, updated_at',
      )
      .maybeSingle<DocumentRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to update the document.');
    }
    if (!data) throw new NotFoundException('Document not found.');

    return this.mapDocument(data);
  }

  async remove(user: AuthenticatedUser, documentId: string) {
    const document = await this.get(user, documentId);
    const client = this.supabase.forUser(user.accessToken);
    const { error } = await client.from('documents').delete().eq('id', documentId);
    if (error) {
      throw new InternalServerErrorException('Unable to delete the document.');
    }

    await this.supabase.admin.storage
      .from('documents')
      .remove([document.storagePath]);

    return { id: documentId };
  }

  async listAnnotations(user: AuthenticatedUser, documentId: string) {
    await this.get(user, documentId);
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('document_annotations')
      .select(
        'id, document_id, annotation_type, page_number, geometry, content, color, created_at, updated_at',
      )
      .eq('document_id', documentId)
      .order('page_number', { ascending: true });

    if (error) {
      throw new InternalServerErrorException('Unable to load annotations.');
    }

    return (data as AnnotationRow[]).map((annotation) =>
      this.mapAnnotation(annotation),
    );
  }

  async addAnnotation(
    user: AuthenticatedUser,
    documentId: string,
    dto: CreateAnnotationDto,
  ) {
    await this.get(user, documentId);
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('document_annotations')
      .insert({
        document_id: documentId,
        user_id: user.id,
        annotation_type: dto.annotationType,
        page_number: dto.pageNumber,
        content: dto.content?.trim() || null,
        color: dto.color ?? null,
        geometry: dto.geometry ?? null,
      })
      .select(
        'id, document_id, annotation_type, page_number, geometry, content, color, created_at, updated_at',
      )
      .single<AnnotationRow>();

    if (error) {
      throw new InternalServerErrorException('Unable to save the annotation.');
    }

    return this.mapAnnotation(data);
  }

  async removeAnnotation(
    user: AuthenticatedUser,
    documentId: string,
    annotationId: string,
  ) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('document_annotations')
      .delete()
      .eq('id', annotationId)
      .eq('document_id', documentId)
      .select('id')
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new InternalServerErrorException('Unable to delete the annotation.');
    }
    if (!data) throw new NotFoundException('Annotation not found.');

    return { id: data.id };
  }

  private mapDocument(document: DocumentRow) {
    return {
      id: document.id,
      title: document.title,
      originalFilename: document.original_filename,
      storagePath: document.storage_path,
      mimeType: document.mime_type,
      sizeBytes: document.size_bytes,
      pageCount: document.page_count,
      lastOpenedPage: document.last_opened_page,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    };
  }

  private mapAnnotation(annotation: AnnotationRow) {
    return {
      id: annotation.id,
      documentId: annotation.document_id,
      annotationType: annotation.annotation_type,
      pageNumber: annotation.page_number,
      geometry: annotation.geometry,
      content: annotation.content,
      color: annotation.color,
      createdAt: annotation.created_at,
      updatedAt: annotation.updated_at,
    };
  }
}
