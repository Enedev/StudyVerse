import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  LoaderCircle,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Tldraw, type Editor } from 'tldraw';
import 'tldraw/tldraw.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  getWhiteboard,
  inviteWhiteboardMember,
  removeWhiteboardMember,
  saveWhiteboard,
} from './whiteboards-api';

export function WhiteboardDetailPage() {
  const { id = '' } = useParams();
  const boardQuery = useQuery({
    queryKey: ['whiteboard', id],
    queryFn: () => getWhiteboard(id),
    enabled: Boolean(id),
  });
  const [saveState, setSaveState] = useState<'Saved' | 'Saving' | 'Unsaved'>(
    'Saved',
  );
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const saveTimer = useRef<number | null>(null);
  const board = boardQuery.data;

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  const scheduleSave = (editor: Editor) => {
    if (board?.role === 'viewer') return;
    setSaveState('Unsaved');
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSaveState('Saving');
      void saveWhiteboard(id, {
        snapshot: editor.getSnapshot() as unknown as Record<string, unknown>,
      })
        .then(() => setSaveState('Saved'))
        .catch((error: unknown) => {
          setSaveState('Unsaved');
          toast.error(
            error instanceof Error ? error.message : 'Unable to save the canvas.',
          );
        });
    }, 900);
  };

  const invite = async () => {
    try {
      await inviteWhiteboardMember(id, email.trim(), role);
      setEmail('');
      await boardQuery.refetch();
      toast.success('Collaborator invited.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to invite.');
    }
  };

  if (boardQuery.isLoading) {
    return (
      <div className="text-muted-foreground flex h-[70vh] items-center justify-center gap-2">
        <LoaderCircle className="animate-spin" />
        Opening canvas…
      </div>
    );
  }

  if (boardQuery.isError || !board) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-3xl">This whiteboard is unavailable</h1>
        <Button className="mt-5" asChild>
          <Link to="/whiteboards">Back to whiteboards</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="-m-5 flex h-[calc(100vh-4.5rem)] min-h-[42rem] flex-col sm:-m-7 lg:-m-10">
      <div className="bg-card flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/whiteboards" aria-label="Back to whiteboards">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{board.title}</h1>
          <p className="text-muted-foreground text-xs capitalize">
            {board.role} · {saveState}
          </p>
        </div>
        {board.role === 'owner' && (
          <div className="ml-auto flex w-full flex-wrap items-center gap-2 lg:w-auto">
            <Input
              className="h-9 w-full sm:w-56"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@example.com"
              type="email"
            />
            <select
              className="border-input bg-background h-9 rounded-lg border px-2 text-xs"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as 'editor' | 'viewer')
              }
            >
              <option value="editor">Can edit</option>
              <option value="viewer">Can view</option>
            </select>
            <Button size="sm" onClick={() => void invite()} disabled={!email.trim()}>
              <UserPlus />
              Invite
            </Button>
          </div>
        )}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="tldraw-theme min-h-0">
          <Tldraw
            onMount={(editor) => {
              if (Object.keys(board.snapshot).length > 0) {
                editor.loadSnapshot(board.snapshot);
              }
              if (board.role === 'viewer') {
                editor.updateInstanceState({ isReadonly: true });
              }
              editor.store.listen(
                () => scheduleSave(editor),
                { source: 'user', scope: 'document' },
              );
            }}
          />
        </div>
        {board.role === 'owner' && (
          <aside className="bg-card hidden overflow-y-auto border-l p-4 lg:block">
            <h2 className="text-sm font-semibold">Collaborators</h2>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Editors can change the canvas. Live cursors require the later
              realtime phase.
            </p>
            <div className="mt-4 space-y-2">
              {board.members.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  Only you can access this board.
                </p>
              ) : (
                board.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between gap-2 rounded-lg border p-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[10px]">
                        {member.userId}
                      </p>
                      <p className="text-muted-foreground text-[10px] capitalize">
                        {member.role}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove collaborator"
                      onClick={() =>
                        void removeWhiteboardMember(id, member.userId).then(() =>
                          boardQuery.refetch(),
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
