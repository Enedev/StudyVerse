import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/features/auth/auth-card';
import { useAuth } from '@/features/auth/auth-context';

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (values: LoginValues) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      const destination =
        (location.state as { from?: string } | null)?.from ?? '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to sign in.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Return to your notes, plans, and ideas."
      footer={
        <>
          New to StudyVerse?{' '}
          <Link className="text-foreground font-semibold" to="/register">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-xs">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              className="text-muted-foreground hover:text-foreground text-xs"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className="text-destructive text-xs">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        <Button className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="animate-spin" />}
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
