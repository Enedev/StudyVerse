import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  BookOpen,
  Heart,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/workspace/page-header';
import { useAuth } from '@/features/auth/use-auth';
import { uploadPrivateFile } from '@/lib/storage';

import { createBook, deleteBook, listBooks, setBookFavorite } from './library-api';
import type { Book } from './library-types';

const emptyBooks: Book[] = [];
const covers = [
  'from-emerald-700 to-slate-900',
  'from-indigo-700 to-slate-900',
  'from-amber-700 to-stone-900',
  'from-rose-700 to-stone-950',
];

function coverClass(title: string) {
  const index = [...title].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return covers[index % covers.length];
}

export function LibraryPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [categories, setCategories] = useState('');
  const [cover, setCover] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const booksQuery = useQuery({
    queryKey: ['books', search, category],
    queryFn: () => listBooks(search, category),
  });
  const createMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });
  const favoriteMutation = useMutation({
    mutationFn: ({ book, favorite }: { book: Book; favorite: boolean }) =>
      setBookFavorite(book.id, favorite),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });
  const books = booksQuery.data ?? emptyBooks;
  const availableCategories = useMemo(
    () => [...new Set(books.flatMap((book) => book.categories))].sort(),
    [books],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    try {
      let coverPath: string | undefined;
      if (cover) {
        const extension = cover.name.split('.').pop()?.toLowerCase() || 'jpg';
        coverPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
        await uploadPrivateFile('book-covers', coverPath, cover);
      }
      await createMutation.mutateAsync({
        title: title.trim(),
        author: author.trim(),
        categories: categories
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        coverPath,
      });
      setTitle('');
      setAuthor('');
      setCategories('');
      setCover(null);
      toast.success('Book added to your library.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add book.');
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        icon={BookOpen}
        eyebrow="Your knowledge, collected"
        title="Library"
        description="Keep the books you are studying, remember your progress, and return to the page where you left off."
      />

      <Card className="p-5">
        <form className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto]" onSubmit={(event) => void submit(event)}>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" required maxLength={240} />
          <Input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Author" maxLength={180} />
          <Input value={categories} onChange={(event) => setCategories(event.target.value)} placeholder="Categories, separated by commas" />
          <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setCover(event.target.files?.[0] ?? null)} />
          <Button disabled={createMutation.isPending || !title.trim()}>
            {createMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Plus />}
            Add
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or author" />
        </div>
        <select className="border-input bg-background h-11 rounded-lg border px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {availableCategories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {booksQuery.isLoading ? (
        <div className="text-muted-foreground flex justify-center gap-2 py-16"><LoaderCircle className="animate-spin" />Loading library…</div>
      ) : booksQuery.isError ? (
        <Card className="p-10 text-center">
          <AlertCircle className="text-destructive mx-auto size-6" />
          <p className="mt-3 text-sm">Run migrations 001 through 005, then refresh.</p>
        </Card>
      ) : books.length === 0 ? (
        <Card className="border-dashed p-12 text-center shadow-none">
          <BookOpen className="text-muted-foreground mx-auto size-6" />
          <h2 className="mt-4 font-semibold">Your shelf is empty</h2>
          <p className="text-muted-foreground mt-2 text-sm">Add the first book you want to keep close.</p>
        </Card>
      ) : (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <Link to={`/library/${book.id}`} className={`bg-gradient-to-br ${coverClass(book.title)} block aspect-[3/4] p-5 text-white`}>
                <strong className="font-serif text-2xl leading-tight">{book.title}</strong>
                <span className="mt-3 block text-xs text-white/70">{book.author ?? 'Unknown author'}</span>
              </Link>
              <div className="space-y-3 p-3">
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div className="bg-primary h-full" style={{ width: `${book.readingProgress}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{book.readingProgress}%</span>
                  <div>
                    <Button variant="ghost" size="icon" aria-label="Toggle favorite" onClick={() => favoriteMutation.mutate({ book, favorite: !book.isFavorite })}>
                      <Heart className={book.isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete book" onClick={() => {
                      if (window.confirm(`Delete "${book.title}"?`)) {
                        deleteMutation.mutate(book.id);
                      }
                    }}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
