import { useQuery } from '@tanstack/react-query';
import {
  CaptureUpdateAction,
  Excalidraw,
  reconcileElements,
} from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { ArrowLeft, LoaderCircle, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/use-auth';
import { supabase } from '@/lib/supabase/client';

import '@excalidraw/excalidraw/index.css';

import {
  getWhiteboard,
  inviteWhiteboardMember,
  removeWhiteboardMember,
  saveWhiteboard,
} from './whiteboards-api';
import type { WhiteboardDetail } from './whiteboard-types';

type SceneElement = { id: string; version: number };

type CanvasSnapshot = {
  elements?: readonly SceneElement[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
};

function sceneSignature(elements: readonly SceneElement[]) {
  return elements.map((element) => `${element.id}:${element.version}`).join('|');
}

function initialScene(snapshot: Record<string, unknown>) {
  const scene = snapshot as CanvasSnapshot;
  if (!Array.isArray(scene.elements)) return null;
  return {
    elements: scene.elements,
    appState: scene.appState,
    files: scene.files,
  };
}

function WhiteboardCanvas({ board }: { board: WhiteboardDetail }) {
  const { user } = useAuth();
  const [saveState, setSaveState] = useState<'Saved' | 'Saving' | 'Unsaved'>(
    'Saved',
  );
  const [peers, setPeers] = useState(1);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const saveTimer = useRef<number | null>(null);
  const opened = useRef(false);
  const applyingRemote = useRef(false);
  const lastSignature = useRef('');
  const pendingSnapshot = useRef<Record<string, unknown> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const scene = initialScene(board.snapshot);

  const persist = () => {
    const snapshot = pendingSnapshot.current;
    if (!snapshot || board.role === 'viewer') return;
    pendingSnapshot.current = null;
    setSaveState('Saving');
    void saveWhiteboard(board.id, { snapshot })
      .then(() => setSaveState('Saved'))
      .catch((error: unknown) => {
        pendingSnapshot.current = snapshot;
        setSaveState('Unsaved');
        toast.error(
          error instanceof Error ? error.message : 'Unable to save the canvas.',
        );
      });
  };

  const applyRemote = (remoteElements: readonly SceneElement[]) => {
    const api = apiRef.current;
    if (!api || applyingRemote.current) return;
    const localElements = api.getSceneElements() as readonly SceneElement[];
    const merged = reconcileElements(
      api.getSceneElements(),
      remoteElements as never,
      api.getAppState(),
    );
    const mergedSignature = sceneSignature(merged);
    if (mergedSignature === sceneSignature(localElements)) return;
    applyingRemote.current = true;
    api.updateScene({
      elements: merged,
      captureUpdate: CaptureUpdateAction.NEVER,
    });
    applyingRemote.current = false;
    lastSignature.current = mergedSignature;
    const remoteSignature = sceneSignature(remoteElements);
    if (mergedSignature !== remoteSignature && board.role !== 'viewer') {
      pendingSnapshot.current = {
        elements: merged,
        files: api.getFiles(),
        appState: { viewBackgroundColor: api.getAppState().viewBackgroundColor },
      };
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(persist, 800);
    }
  };

  useEffect(() => {
    const blockLocalSave = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const flush = () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      persist();
    };
    window.addEventListener('keydown', blockLocalSave, true);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('keydown', blockLocalSave, true);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [board.id, board.role]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void getWhiteboard(board.id)
        .then((remote) => {
          const remoteScene = initialScene(remote.snapshot);
          if (remoteScene?.elements) applyRemote(remoteScene.elements);
        })
        .catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [board.id, board.role]);

  useEffect(() => {
    const channel = supabase.channel(`whiteboard:${board.id}`, {
      config: { broadcast: { self: false }, presence: { key: user?.id ?? board.id } },
    });
    channelRef.current = channel;
    channel
      .on('broadcast', { event: 'elements' }, ({ payload }) => {
        const elements = (payload as { elements?: readonly SceneElement[] }).elements;
        if (elements) applyRemote(elements);
      })
      .on('presence', { event: 'sync' }, () => {
        setPeers(Object.keys(channel.presenceState()).length || 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId: user?.id ?? 'guest' });
        }
      });
    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [board.id, user?.id]);

  const scheduleSave = (
    elements: readonly SceneElement[],
    appState: { viewBackgroundColor: string },
    files: Record<string, unknown>,
  ) => {
    if (board.role === 'viewer' || applyingRemote.current) return;
    const signature = sceneSignature(elements);
    if (!opened.current) {
      opened.current = true;
      lastSignature.current = signature;
      return;
    }
    if (signature === lastSignature.current) return;
    lastSignature.current = signature;
    pendingSnapshot.current = {
      elements,
      files,
      appState: { viewBackgroundColor: appState.viewBackgroundColor },
    };
    setSaveState('Unsaved');
    void channelRef.current?.send({
      type: 'broadcast',
      event: 'elements',
      payload: { elements },
    });
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(persist, 500);
  };

  const invite = async () => {
    try {
      await inviteWhiteboardMember(board.id, email.trim(), role);
      setEmail('');
      toast.success('Collaborator invited. They can open this board and draw with you.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to invite.');
    }
  };

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
            {board.role} · {saveState === 'Saved' ? 'Saved to your account' : saveState}
            {' · '}
            {peers} here now
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
        <div className="h-full min-h-0">
          <Excalidraw
            excalidrawAPI={(api) => {
              apiRef.current = api;
            }}
            initialData={scene as ComponentProps<typeof Excalidraw>['initialData']}
            viewModeEnabled={board.role === 'viewer'}
            UIOptions={{
              canvasActions: {
                export: false,
                loadScene: false,
                saveAsImage: false,
                saveToActiveFile: false,
              },
            }}
            onChange={(elements, appState, files) => {
              scheduleSave(elements, appState, files);
            }}
          />
        </div>
        {board.role === 'owner' && (
          <aside className="bg-card hidden overflow-y-auto border-l p-4 lg:block">
            <h2 className="text-sm font-semibold">Collaborators</h2>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              People with access see the same canvas within a couple of seconds.
              Invite them with an account email.
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
                      <p className="truncate font-mono text-[10px]">{member.userId}</p>
                      <p className="text-muted-foreground text-[10px] capitalize">
                        {member.role}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove collaborator"
                      onClick={() =>
                        void removeWhiteboardMember(board.id, member.userId).then(
                          () => toast.success('Collaborator removed.'),
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

export function WhiteboardDetailPage() {
  const { id = '' } = useParams();
  const boardQuery = useQuery({
    queryKey: ['whiteboard', id],
    queryFn: () => getWhiteboard(id),
    enabled: Boolean(id),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  if (boardQuery.isError) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-3xl">This whiteboard is unavailable</h1>
        <Button className="mt-5" asChild>
          <Link to="/whiteboards">Back to whiteboards</Link>
        </Button>
      </div>
    );
  }

  if (!boardQuery.isFetchedAfterMount || !boardQuery.data) {
    return (
      <div className="text-muted-foreground flex h-[70vh] items-center justify-center gap-2">
        <LoaderCircle className="animate-spin" />
        Opening the saved canvas…
      </div>
    );
  }

  return <WhiteboardCanvas key={boardQuery.data.id} board={boardQuery.data} />;
}
