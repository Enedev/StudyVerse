import { LogOut, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  navigationItems,
  settingsItem,
  type NavigationItem,
} from '@/components/navigation/app-navigation';
import { Brand } from '@/components/navigation/brand';
import { ThemeToggle } from '@/components/navigation/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/use-auth';
import { cn } from '@/lib/utils';

function NavigationLink({
  item,
  onNavigate,
}: {
  item: NavigationItem;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'text-muted-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-secondary text-secondary-foreground'
            : 'hover:bg-muted hover:text-foreground',
        )
      }
    >
      <Icon className="size-4.5" />
      {item.label}
    </NavLink>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activeItem = [...navigationItems, settingsItem].find((item) =>
    location.pathname.startsWith(item.href),
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      toast.error('We could not sign you out. Please try again.');
    }
  };

  const sidebar = (
    <>
      <div className="flex h-18 items-center px-5">
        <Brand />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
        <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-widest uppercase">
          Workspace
        </p>
        {navigationItems.map((item) => (
          <NavigationLink
            key={item.href}
            item={item}
            onNavigate={() => setMobileOpen(false)}
          />
        ))}
        <div className="mt-auto pt-6">
          <NavigationLink
            item={settingsItem}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
            {user?.email?.slice(0, 1).toUpperCase() ?? 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.user_metadata.display_name ?? 'Student'}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() => void handleSignOut()}
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-muted/25 min-h-screen">
      <aside className="bg-card fixed inset-y-0 left-0 z-40 hidden w-64 border-r lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="bg-card relative flex h-full w-72 flex-col shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="bg-background/85 sticky top-0 z-30 flex h-18 items-center gap-4 border-b px-4 backdrop-blur-xl sm:px-7">
          <Button
            className="lg:hidden"
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <div>
            <p className="text-muted-foreground text-xs">Your workspace</p>
            <h1 className="text-sm font-semibold">
              {activeItem?.label ?? 'StudyVerse'}
            </h1>
          </div>
          <div className="relative ml-auto hidden w-full max-w-xs sm:block">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="bg-muted/60 h-9 pl-9"
              placeholder="Search workspace"
              aria-label="Search workspace"
              disabled
              title="Workspace search arrives in a later phase"
            />
          </div>
          <ThemeToggle />
        </header>

        <main className="mx-auto max-w-7xl p-5 sm:p-7 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
