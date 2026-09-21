import {
  Check,
  Laptop,
  LoaderCircle,
  LockKeyhole,
  Moon,
  Palette,
  Settings,
  Sun,
  UserRound,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/workspace/page-header';
import { useAuth } from '@/features/auth/use-auth';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const themes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Laptop },
];

const sections = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: LockKeyhole },
] as const;

type SectionId = (typeof sections)[number]['id'];

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [section, setSection] = useState<SectionId>('profile');
  const [displayName, setDisplayName] = useState(
    String(user?.user_metadata.display_name ?? ''),
  );
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void supabase
      .from('profiles')
      .select('display_name, timezone')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        if (data.display_name) setDisplayName(data.display_name);
        if (data.timezone) setTimezone(data.timezone);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const name = displayName.trim();
    if (name.length < 2) {
      toast.error('Enter a display name.');
      return;
    }
    setIsSavingProfile(true);
    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: name },
    });
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: name,
      timezone: timezone.trim() || 'UTC',
    });
    setIsSavingProfile(false);
    if (authError || profileError) {
      toast.error(authError?.message ?? profileError?.message ?? 'Unable to save your profile.');
      return;
    }
    toast.success('Profile saved.');
  };

  const savePassword = async () => {
    if (password.length < 8) {
      toast.error('Use at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword('');
    setConfirmPassword('');
    toast.success('Password updated.');
  };

  return (
    <div className="space-y-7">
      <PageHeader
        icon={Settings}
        eyebrow="Make it yours"
        title="Settings"
        description="Update the name on your account, the look of the workspace, and your password."
      />

      <div className="grid gap-5 xl:grid-cols-[14rem_minmax(0,1fr)]">
        <nav className="space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium',
                section === id
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              onClick={() => setSection(id)}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-5">
          {section === 'profile' && (
            <Card>
              <div className="border-b p-6">
                <h3 className="font-semibold">Profile</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  This name appears in the workspace sidebar.
                </p>
              </div>
              <form
                className="space-y-5 p-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveProfile();
                }}
              >
                <div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-2xl font-serif text-2xl">
                  {(displayName || user?.email || 'S').slice(0, 1).toUpperCase()}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="settingsName">Display name</Label>
                    <Input
                      id="settingsName"
                      value={displayName}
                      maxLength={80}
                      onChange={(event) => setDisplayName(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settingsEmail">Email</Label>
                    <Input id="settingsEmail" value={user?.email ?? ''} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settingsTimezone">Timezone</Label>
                  <Input
                    id="settingsTimezone"
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile && <LoaderCircle className="animate-spin" />}
                  Save profile
                </Button>
              </form>
            </Card>
          )}

          {section === 'appearance' && (
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
                      <span className="mt-3 block text-xs font-semibold">{label}</span>
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
          )}

          {section === 'security' && (
            <Card>
              <div className="border-b p-6">
                <h3 className="font-semibold">Password</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Use at least 8 characters. You stay signed in after the change.
                </p>
              </div>
              <form
                className="space-y-4 p-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  void savePassword();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isSavingPassword}>
                  {isSavingPassword ? <LoaderCircle className="animate-spin" /> : <LockKeyhole />}
                  Update password
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
