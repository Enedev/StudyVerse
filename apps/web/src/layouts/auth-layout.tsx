import { ArrowLeft, BookOpenCheck } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import { Brand } from '@/components/navigation/brand';
import { ThemeToggle } from '@/components/navigation/theme-toggle';
import { Button } from '@/components/ui/button';

export function AuthLayout() {
  return (
    <div className="bg-background grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <aside className="bg-primary text-primary-foreground relative hidden overflow-hidden p-10 lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_0_1px,transparent_1px)] [background-size:28px_28px]" />
        <Brand className="relative text-white" />
        <div className="relative my-auto max-w-xl">
          <BookOpenCheck className="text-accent mb-8 size-12" />
          <blockquote className="font-serif text-4xl leading-tight">
            “Learning becomes lighter when everything has a thoughtful place.”
          </blockquote>
          <p className="mt-6 text-sm text-white/65">Welcome to StudyVerse</p>
        </div>
      </aside>

      <main className="paper-grain flex min-h-screen flex-col">
        <header className="flex h-18 items-center justify-between px-5 sm:px-8">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft />
              Back home
            </Link>
          </Button>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
