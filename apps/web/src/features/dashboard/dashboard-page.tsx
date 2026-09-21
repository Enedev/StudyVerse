import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  ListTodo,
  NotebookPen,
  Shapes,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/features/auth/use-auth';

const spaces = [
  {
    title: 'Tasks',
    description: 'Shape your next steps',
    href: '/tasks',
    icon: ListTodo,
  },
  {
    title: 'Calendar',
    description: 'See your academic rhythm',
    href: '/calendar',
    icon: CalendarDays,
  },
  {
    title: 'Whiteboards',
    description: 'Give ideas more room',
    href: '/whiteboards',
    icon: Shapes,
  },
  {
    title: 'Notebooks',
    description: 'Write and draw on paper',
    href: '/notebooks',
    icon: NotebookPen,
  },
  {
    title: 'Library',
    description: 'Gather what inspires you',
    href: '/library',
    icon: BookOpen,
  },
  {
    title: 'Documents',
    description: 'Read and mark up PDFs',
    href: '/documents',
    icon: FileText,
  },
];

export function DashboardPage() {
  const { user } = useAuth();
  const firstName =
    String(user?.user_metadata.display_name ?? 'there').split(' ')[0] ??
    'there';

  return (
    <div className="space-y-8">
      <section className="bg-primary text-primary-foreground relative overflow-hidden rounded-2xl p-7 shadow-lg sm:p-9">
        <div className="absolute -top-16 -right-10 size-52 rounded-full border border-white/10" />
        <div className="absolute -right-16 -bottom-24 size-72 rounded-full border border-white/10" />
        <div className="relative max-w-2xl">
          <span className="text-accent flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="size-4" />
            Your study space
          </span>
          <h2 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">
            Good to see you, {firstName}.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
            Your workspace is ready. The next phases will connect your tasks,
            calendar, documents, and ideas here.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              Your spaces
            </p>
            <h2 className="mt-1 text-xl font-semibold">Where will you begin?</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {spaces.map(({ title, description, href, icon: Icon }) => (
            <Link key={href} to={href}>
              <Card className="group h-full p-5 transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="bg-secondary text-secondary-foreground flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-4.5" />
                </div>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {description}
                </p>
                <ArrowRight className="text-muted-foreground mt-5 size-4 transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <EmptyState
          icon={ListTodo}
          title="No tasks here yet"
          description="Task creation and scheduling will be introduced in the next product phase."
          action={
            <Button variant="outline" asChild>
              <Link to="/tasks">View task foundation</Link>
            </Button>
          }
        />
        <EmptyState
          icon={BookOpen}
          title="Your library is waiting"
          description="Document uploads and reading progress will arrive with the library phase."
          action={
            <Button variant="outline" asChild>
              <Link to="/library">View library foundation</Link>
            </Button>
          }
        />
      </section>
    </div>
  );
}
