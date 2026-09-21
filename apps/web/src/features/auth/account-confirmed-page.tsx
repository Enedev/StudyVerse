import { Check, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/features/auth/auth-card';
import { useAuth } from '@/features/auth/use-auth';
import { supabase } from '@/lib/supabase/client';

function readAuthMessage() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return {
    type: search.get('type') ?? hash.get('type'),
    error: search.get('error_description') ?? hash.get('error_description'),
  };
}

export function AccountConfirmedPage() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [{ type, error }] = useState(readAuthMessage);
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedPassword, setSavedPassword] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isRecovery = type === 'recovery' || location.hash.includes('type=recovery');

  const savePassword = async () => {
    setIsSaving(true);
    setSaveError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSaving(false);
    if (updateError) {
      setSaveError(updateError.message);
      return;
    }
    setSavedPassword(true);
  };

  if (isLoading) {
    return (
      <AuthCard title="Confirming your account" description="This only takes a moment.">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <LoaderCircle className="animate-spin" />
          Checking the confirmation link…
        </div>
      </AuthCard>
    );
  }

  if (error) {
    return (
      <AuthCard
        title="This link did not work"
        description={error}
        footer={<Link to="/login">Back to sign in</Link>}
      >
        <Button asChild>
          <Link to="/register">Create another account</Link>
        </Button>
      </AuthCard>
    );
  }

  if (isRecovery && !savedPassword) {
    return (
      <AuthCard
        title="Choose a new password"
        description="Your reset link is valid. Set the password you want to use from now on."
      >
        <form
          className="space-y-4"
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
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {saveError && <p className="text-destructive text-sm">{saveError}</p>}
          <Button type="submit" disabled={isSaving || password.length < 8}>
            {isSaving && <LoaderCircle className="animate-spin" />}
            Save password
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Your account is verified"
      description={
        user
          ? 'The confirmation worked. You can enter your workspace now.'
          : 'The confirmation worked. Sign in with the email and password you just created.'
      }
    >
      <div className="bg-secondary text-secondary-foreground flex items-start gap-3 rounded-xl p-4 text-sm">
        <Check className="mt-0.5 size-4 shrink-0" />
        Email confirmed. StudyVerse is ready for you.
      </div>
      <Button className="mt-5 w-full" asChild>
        <Link to={user ? '/dashboard' : '/login'}>
          {user ? 'Enter StudyVerse' : 'Sign in'}
        </Link>
      </Button>
    </AuthCard>
  );
}
