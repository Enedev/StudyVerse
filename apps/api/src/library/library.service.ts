import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/authenticated-user.js';
import { SupabaseService } from '../database/supabase.service.js';
import {
  CreateBookDto,
  ListBooksQueryDto,
  UpdateBookDto,
} from './dto/library.dto.js';

type BookRow = {
  id: string;
  title: string;
  author: string | null;
  document_id: string | null;
  cover_path: string | null;
  categories: string[];
  reading_progress: number | string;
  last_opened_page: number;
  created_at: string;
  updated_at: string;
  favorites?: { id: string }[];
};

@Injectable()
export class LibraryService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(user: AuthenticatedUser, query: ListBooksQueryDto) {
    const client = this.supabase.forUser(user.accessToken);
    let request = client
      .from('books')
      .select(
        'id, title, author, document_id, cover_path, categories, reading_progress, last_opened_page, created_at, updated_at, favorites(id)',
      )
      .order('updated_at', { ascending: false });

    if (query.search) {
      const safeSearch = query.search.replace(/[%_,.()]/g, '').trim();
      if (safeSearch) {
        request = request.or(
          `title.ilike.%${safeSearch}%,author.ilike.%${safeSearch}%`,
        );
      }
    }
    if (query.category) request = request.contains('categories', [query.category]);

    const { data, error } = await request;
    if (error) throw new InternalServerErrorException('Unable to load books.');

    return (data as BookRow[]).map((book) => this.mapBook(book));
  }

  async get(user: AuthenticatedUser, bookId: string) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('books')
      .select(
        'id, title, author, document_id, cover_path, categories, reading_progress, last_opened_page, created_at, updated_at, favorites(id)',
      )
      .eq('id', bookId)
      .maybeSingle<BookRow>();

    if (error) throw new InternalServerErrorException('Unable to load the book.');
    if (!data) throw new NotFoundException('Book not found.');

    return this.mapBook(data);
  }

  async create(user: AuthenticatedUser, dto: CreateBookDto) {
    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('books')
      .insert({
        user_id: user.id,
        title: dto.title.trim(),
        author: dto.author?.trim() || null,
        document_id: dto.documentId ?? null,
        cover_path: dto.coverPath ?? null,
        categories: dto.categories ?? [],
      })
      .select(
        'id, title, author, document_id, cover_path, categories, reading_progress, last_opened_page, created_at, updated_at',
      )
      .single<BookRow>();

    if (error) throw new InternalServerErrorException('Unable to create the book.');

    return this.mapBook({ ...data, favorites: [] });
  }

  async update(user: AuthenticatedUser, bookId: string, dto: UpdateBookDto) {
    const updates: Record<string, unknown> = {};
    if (dto.title !== undefined) updates.title = dto.title.trim();
    if (dto.author !== undefined) updates.author = dto.author.trim() || null;
    if (dto.documentId !== undefined) updates.document_id = dto.documentId || null;
    if (dto.coverPath !== undefined) updates.cover_path = dto.coverPath || null;
    if (dto.categories !== undefined) updates.categories = dto.categories;
    if (dto.readingProgress !== undefined) {
      updates.reading_progress = dto.readingProgress;
    }
    if (dto.lastOpenedPage !== undefined) {
      updates.last_opened_page = dto.lastOpenedPage;
    }

    const client = this.supabase.forUser(user.accessToken);
    const { data, error } = await client
      .from('books')
      .update(updates)
      .eq('id', bookId)
      .select(
        'id, title, author, document_id, cover_path, categories, reading_progress, last_opened_page, created_at, updated_at, favorites(id)',
      )
      .maybeSingle<BookRow>();

    if (error) throw new InternalServerErrorException('Unable to update the book.');
    if (!data) throw new NotFoundException('Book not found.');

    return this.mapBook(data);
  }

  async remove(user: AuthenticatedUser, bookId: string) {
    const book = await this.get(user, bookId);
    const client = this.supabase.forUser(user.accessToken);
    const { error } = await client.from('books').delete().eq('id', bookId);
    if (error) throw new InternalServerErrorException('Unable to delete the book.');
    if (book.coverPath) {
      await this.supabase.admin.storage.from('book-covers').remove([book.coverPath]);
    }
    return { id: bookId };
  }

  async setFavorite(
    user: AuthenticatedUser,
    bookId: string,
    favorite: boolean,
  ) {
    await this.get(user, bookId);
    const client = this.supabase.forUser(user.accessToken);

    if (!favorite) {
      const { error } = await client
        .from('favorites')
        .delete()
        .eq('book_id', bookId);
      if (error) {
        throw new InternalServerErrorException('Unable to update the favorite.');
      }
    } else {
      const { error } = await client.from('favorites').insert({
        user_id: user.id,
        book_id: bookId,
      });
      if (error && !error.message.includes('duplicate')) {
        throw new InternalServerErrorException('Unable to update the favorite.');
      }
    }

    return this.get(user, bookId);
  }

  private mapBook(book: BookRow) {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      documentId: book.document_id,
      coverPath: book.cover_path,
      categories: book.categories,
      readingProgress: Number(book.reading_progress),
      lastOpenedPage: book.last_opened_page,
      isFavorite: (book.favorites?.length ?? 0) > 0,
      createdAt: book.created_at,
      updatedAt: book.updated_at,
    };
  }
}
