import { apiFetch } from '@/lib/api/client';

import type { Book, SaveBookInput } from './library-types';

export function listBooks(search = '', category = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  const query = params.toString();
  return apiFetch<Book[]>(`/books${query ? `?${query}` : ''}`);
}

export function getBook(bookId: string) {
  return apiFetch<Book>(`/books/${bookId}`);
}

export function createBook(input: SaveBookInput) {
  return apiFetch<Book>('/books', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateBook(bookId: string, input: Partial<SaveBookInput>) {
  return apiFetch<Book>(`/books/${bookId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteBook(bookId: string) {
  return apiFetch<{ id: string }>(`/books/${bookId}`, { method: 'DELETE' });
}

export function setBookFavorite(bookId: string, favorite: boolean) {
  return apiFetch<Book>(`/books/${bookId}/favorite`, {
    method: favorite ? 'POST' : 'DELETE',
  });
}
