import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { Brand } from '@/components/navigation/brand';
import { ThemeToggle } from '@/components/navigation/theme-toggle';
import { Button } from '@/components/ui/button';

export function PublicLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="paper-grain min-h-screen">
      <header className="border-border/70 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Brand />

          <nav className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" asChild>
              <Link to="/welcome">The story</Link>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </nav>

          <Button
            className="md:hidden"
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {isOpen && (
          <nav className="bg-background border-t px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              <Button variant="ghost" asChild>
                <Link to="/welcome" onClick={() => setIsOpen(false)}>
                  The story
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  Get started
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </header>
      <Outlet />
    </div>
  );
}
