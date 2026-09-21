import {
  ArrowUpRight,
  Clock3,
  MoreHorizontal,
  Plus,
  Search,
  Shapes,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/workspace/page-header';
import { PreviewNotice } from '@/components/workspace/preview-notice';

const boards = [
  {
    id: 'cell-biology-map',
    title: 'Cell biology concept map',
    subject: 'Biology',
    updated: '12 minutes ago',
    tone: 'from-emerald-100 to-teal-50 dark:from-emerald-950 dark:to-slate-900',
    nodes: ['Mitochondria', 'ATP', 'Respiration'],
  },
  {
    id: 'research-plan',
    title: 'Research presentation plan',
    subject: 'History',
    updated: 'Yesterday',
    tone: 'from-amber-100 to-orange-50 dark:from-amber-950 dark:to-slate-900',
    nodes: ['Question', 'Sources', 'Argument'],
  },
  {
    id: 'calculus-review',
    title: 'Calculus review',
    subject: 'Mathematics',
    updated: 'Sep 18',
    tone: 'from-sky-100 to-indigo-50 dark:from-sky-950 dark:to-slate-900',
    nodes: ['Limits', 'Derivatives', 'Integrals'],
  },
];

export function WhiteboardsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        icon={Shapes}
        eyebrow="Think without edges"
        title="Whiteboards"
        description="A visual space for connecting concepts, sketching explanations, and eventually creating together in real time."
        action={
          <Button disabled title="Board creation arrives with tldraw persistence">
            <Plus />
            New board
          </Button>
        }
      />

      <PreviewNotice>
        These are example boards for evaluating the experience. The detail
        canvas is navigable, while editing and persistence will use tldraw in
        the dedicated whiteboard phase.
      </PreviewNotice>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Search boards"
            disabled
            title="Board search arrives with persistence"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">3 example boards</Badge>
          <Badge variant="outline">Private workspace</Badge>
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {boards.map((board) => (
          <Card
            key={board.id}
            className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <Link to={`/whiteboards/${board.id}`} className="block">
              <div
                className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${board.tone} p-5`}
              >
                <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(currentColor_0.7px,transparent_0.7px)] [background-size:14px_14px]" />
                <div className="relative h-full">
                  <div className="bg-card/85 absolute top-[12%] left-[22%] rounded-full border px-3 py-1.5 text-[10px] font-semibold shadow-sm">
                    {board.nodes[0]}
                  </div>
                  <div className="bg-card/85 absolute bottom-[20%] left-[8%] rounded-full border px-3 py-1.5 text-[10px] font-semibold shadow-sm">
                    {board.nodes[1]}
                  </div>
                  <div className="bg-card/85 absolute right-[7%] bottom-[26%] rounded-full border px-3 py-1.5 text-[10px] font-semibold shadow-sm">
                    {board.nodes[2]}
                  </div>
                  <span className="bg-foreground/20 absolute top-[43%] left-[32%] h-px w-[35%] rotate-[24deg]" />
                  <span className="bg-foreground/20 absolute top-[44%] left-[24%] h-px w-[25%] rotate-[126deg]" />
                  <div className="bg-primary text-primary-foreground absolute top-[27%] right-[16%] flex items-center gap-1 rounded px-2 py-1 text-[8px] shadow">
                    <Users className="size-2.5" />
                    You
                  </div>
                </div>
                <div className="bg-background/85 absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
                  <ArrowUpRight className="size-4" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{board.title}</h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {board.subject}
                    </p>
                  </div>
                  <span className="text-muted-foreground flex size-9 items-center justify-center">
                    <MoreHorizontal />
                  </span>
                </div>
                <div className="text-muted-foreground mt-4 flex items-center gap-2 text-[11px]">
                  <Clock3 className="size-3.5" />
                  Updated {board.updated}
                </div>
              </div>
            </Link>
          </Card>
        ))}

        <button
          type="button"
          disabled
          className="border-border text-muted-foreground flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed bg-card/35 p-8"
          title="Board creation arrives with tldraw persistence"
        >
          <span className="bg-muted flex size-12 items-center justify-center rounded-xl">
            <Plus className="size-5" />
          </span>
          <strong className="text-foreground mt-4 text-sm">
            Create a whiteboard
          </strong>
          <span className="mt-2 max-w-48 text-xs leading-relaxed">
            tldraw editing and saving will be connected next.
          </span>
        </button>
      </section>
    </div>
  );
}
