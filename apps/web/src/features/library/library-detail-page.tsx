import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Heart, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PdfReader } from '@/features/documents/pdf-reader';
import { createSignedFileUrl } from '@/lib/storage';

import { getBook, setBookFavorite, updateBook } from './library-api';

export function LibraryDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const bookQuery = useQuery({
    queryKey: ['book', id],
    queryFn: () => getBook(id),
    enabled: Boolean(id),
  });
  const [progressOverride, setProgress] = useState<number | null>(null);
  const [pageOverride, setPage] = useState<number | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const book = bookQuery.data;
  const progress = progressOverride ?? book?.readingProgress ?? 0;
  const page = pageOverride ?? book?.lastOpenedPage ?? 1;

  useEffect(() => {
    if (!book?.coverPath) return;
    let active = true;
    void createSignedFileUrl('book-covers', book.coverPath)
      .then((url) => {
        if (active) setCoverUrl(url);
      })
      .catch(() => {
        if (active) setCoverUrl(null);
      });
    return () => {
      active = false;
    };
  }, [book?.coverPath]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateBook(id, { readingProgress: progress, lastOpenedPage: page }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['book', id] });
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Reading progress saved.');
    },
  });

  if (book?.documentId) {
    return (
      <PdfReader
        documentId={book.documentId}
        backTo="/library"
        backLabel="Back to library"
        headerExtra={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setBookFavorite(book.id, !book.isFavorite).then(() =>
                bookQuery.refetch(),
              )
            }
          >
            <Heart className={book.isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
            {book.isFavorite ? 'Favorited' : 'Favorite'}
          </Button>
        }
        onPageChange={(nextPage, pageCount) => {
          void updateBook(book.id, {
            lastOpenedPage: nextPage,
            readingProgress: Math.round((nextPage / pageCount) * 100),
          });
        }}
      />
    );
  }

  if (bookQuery.isLoading) {
    return <div className="text-muted-foreground flex justify-center py-20"><LoaderCircle className="animate-spin" /></div>;
  }

  if (!book) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-3xl">Book not found</h1>
        <Button className="mt-5" asChild><Link to="/library">Back to library</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <Button variant="ghost" asChild>
        <Link to="/library"><ArrowLeft />Library</Link>
      </Button>
      <section className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div className="bg-primary text-primary-foreground relative flex aspect-[3/4] items-end overflow-hidden rounded-2xl p-6 shadow-xl">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div>
              <strong className="font-serif text-3xl">{book.title}</strong>
              <p className="mt-3 text-sm text-white/70">{book.author ?? 'Unknown author'}</p>
            </div>
          )}
        </div>
        <div>
          <h1 className="font-serif text-5xl font-medium">{book.title}</h1>
          <p className="text-muted-foreground mt-2">{book.author ?? 'Unknown author'}</p>
          <p className="mt-4 text-sm">{book.categories.join(' · ') || 'No categories'}</p>
          <Card className="mt-8 max-w-xl space-y-4 p-5">
            <label className="block text-sm font-medium">
              Reading progress: {progress}%
              <input className="mt-3 w-full" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
            </label>
            <label className="block text-sm font-medium">
              Last opened page
              <Input className="mt-2" type="number" min="1" value={page} onChange={(event) => setPage(Number(event.target.value))} />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save progress</Button>
              <Button variant="outline" onClick={() => setBookFavorite(book.id, !book.isFavorite).then(() => bookQuery.refetch())}>
                <Heart className={book.isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
                {book.isFavorite ? 'Favorited' : 'Favorite'}
              </Button>
              {book.documentId && (
                <Button variant="outline" asChild>
                  <Link to={`/documents/${book.documentId}`}><BookOpen />Open linked PDF</Link>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
