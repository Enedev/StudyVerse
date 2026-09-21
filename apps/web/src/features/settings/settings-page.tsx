import {
  Bell,
  Check,
  Laptop,
  LockKeyhole,
  Moon,
  Palette,
  Settings,
  Sun,
  UserRound,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/workspace/page-header';
import { PreviewNotice } from '@/components/workspace/preview-notice';
import { useAuth } from '@/features/auth/use-auth';
import { cn } from '@/lib/utils';

const themes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Laptop },
];

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const displayName = String(user?.user_metadata.display_name ?? '');

  return (
    <div className="space-y-7">
      <PageHeader
        icon={Settings}
        eyebrow="Make it yours"
        title="Settings"
        description="Manage how StudyVerse looks and prepare your profile, preferences, and security settings."
      />

      <PreviewNotice>
        Appearance selection is fully functional. Profile and security changes
        remain read-only until the profile update API is connected.
      </PreviewNotice>

      <div className="grid gap-5 xl:grid-cols-[14rem_minmax(0,1fr)]">
        <nav className="space-y-1">
          {[
            { label: 'Profile', icon: UserRound, active: true },
            { label: 'Appearance', icon: Palette, active: false },
            { label: 'Notifications', icon: Bell, active: false },
            { label: 'Security', icon: LockKeyhole, active: false },
          ].map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              disabled={!active}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium',
                active
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground opacity-60',
              )}
            >
              <Icon className="size-4" />
              {label}
              {!active && (
                <Badge variant="outline" className="ml-auto text-[9px]">
                  Soon
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="space-y-5">
          <Card>
            <div className="border-b p-6">
              <h3 className="font-semibold">Profile</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Your identity across the StudyVerse workspace.
              </p>
            </div>
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-2xl font-serif text-2xl">
                  {user?.email?.slice(0, 1).toUpperCase() ?? 'S'}
                </div>
                <div>
                  <Button variant="outline" size="sm" disabled>
                    Change photo
                  </Button>
                  <p className="text-muted-foreground mt-2 text-[10px]">
                    Avatar uploads arrive with profile storage.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="settingsName">Display name</Label>
                  <Input
                    id="settingsName"
                    value={displayName}
                    placeholder="Your name"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settingsEmail">Email</Label>
                  <Input
                    id="settingsEmail"
                    value={user?.email ?? ''}
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settingsTimezone">Timezone</Label>
                <Input
                  id="settingsTimezone"
                  value="America/Bogota (UTC-5)"
                  readOnly
                />
              </div>
              <Button disabled>Save profile</Button>
            </div>
          </Card>

          <Card>
            <div className="border-b p-6">
              <h3 className="font-semibold">Appearance</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Choose how your workspace feels.
              </p>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-3">
              {themes.map(({ id, label, icon: Icon }) => {
                const isActive = theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={cn(
                      'relative rounded-xl border p-4 text-left transition-all',
                      isActive
                        ? 'border-primary ring-primary/15 ring-4'
                        : 'hover:border-ring',
                    )}
                    onClick={() => setTheme(id)}
                  >
                    <div
                      className={cn(
                        'flex h-20 items-center justify-center rounded-lg border',
                        id === 'light' && 'bg-[#f7f3ea] text-slate-800',
                        id === 'dark' && 'bg-[#111821] text-slate-100',
                        id === 'system' &&
                          'bg-gradient-to-r from-[#f7f3ea] to-[#111821] text-slate-500',
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span className="mt-3 block text-xs font-semibold">
                      {label}
                    </span>
                    {isActive && (
                      <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-5 items-center justify-center rounded-full">
                        <Check className="size-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">Account security</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Password changes use Supabase Auth recovery flows.
                </p>
              </div>
              <Button variant="outline" disabled>
                <LockKeyhole />
                Change password
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
