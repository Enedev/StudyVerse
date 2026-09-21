import {
  AlertCircle,
  Clock3,
  LoaderCircle,
  Plus,
  Shapes,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/workspace/page-header';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createWhiteboard, deleteWhiteboard, listWhiteboards } from './whiteboards-api';

function formatUpdated(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function WhiteboardsPage() {
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const boardsQuery = useQuery({
    queryKey: ['whiteboards'],
    queryFn: listWhiteboards,
  });
  const createMutation = useMutation({
    mutationFn: createWhiteboard,
    onSuccess: async (board) => {
      await queryClient.invalidateQueries({ queryKey: ['whiteboards'] });
      navigate(`/whiteboards/${board.id}`);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteWhiteboard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whiteboards'] }),
  });
  const boards = boardsQuery.data ?? [];

  const createBoard = async () => {
    if (!title.trim()) return;
    try {
      await createMutation.mutateAsync(title.trim());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to create the board.',
      );
    }
  };

  const removeBoard = async (id: string, boardTitle: string) => {
    if (!window.confirm(`Delete "${boardTitle}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Whiteboard deleted.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete the board.',
      );
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        icon={Shapes}
        eyebrow="Think without edges"
        title="Whiteboards"
        description="Draw, write, and arrange ideas on a real tldraw canvas. Every change is saved to your private workspace."
      />

      <Card className="flex flex-col gap-3 p-4 sm:flex-row">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Name a new whiteboard"
          maxLength={240}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void createBoard();
          }}
        />
        <Button
          onClick={() => void createBoard()}
          disabled={!title.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Plus />
          )}
          Create board
        </Button>
      </Card>

      {boardsQuery.isLoading ? (
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-20">
          <LoaderCircle className="animate-spin" />
          Loading whiteboards…
        </div>
      ) : boardsQuery.isError ? (
        <Card className="p-10 text-center">
          <AlertCircle className="text-destructive mx-auto size-6" />
          <h2 className="mt-4 font-semibold">Whiteboards are unavailable</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Run migrations 001 through 005 in Supabase, then try again.
          </p>
        </Card>
      ) : boards.length === 0 ? (
        <Card className="border-dashed p-12 text-center shadow-none">
          <Shapes className="text-muted-foreground mx-auto size-6" />
          <h2 className="mt-4 font-semibold">Your canvas is still blank</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Create a whiteboard and start thinking visually.
          </p>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {boards.map((board) => (
            <Card key={board.id} className="group overflow-hidden">
              <Link to={`/whiteboards/${board.id}`} className="block p-5">
                <div className="bg-muted/60 relative mb-5 aspect-[16/9] overflow-hidden rounded-lg border">
                  <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(currentColor_0.7px,transparent_0.7px)] [background-size:16px_16px]" />
                  <Shapes className="text-muted-foreground absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{board.title}</h2>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                      <Clock3 className="size-3.5" />
                      {formatUpdated(board.updatedAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {board.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-4 flex items-center gap-1 text-xs">
                  <Users className="size-3.5" />
                  {board.memberCount} collaborator
                  {board.memberCount === 1 ? '' : 's'}
                </p>
              </Link>
              {board.role === 'owner' && (
                <div className="border-t px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => void removeBoard(board.id, board.title)}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
