import { zodResolver } from '@hookform/resolvers/zod';
import { Check, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/features/auth/auth-card';
import { useAuth } from '@/features/auth/use-auth';

const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Enter your name.').max(80),
    email: z.email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .regex(/[A-Z]/, 'Include at least one uppercase letter.')
      .regex(/[0-9]/, 'Include at least one number.'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const { user, signUp } = useAuth();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (values: RegisterValues) => {
    setIsSubmitting(true);
    try {
      await signUp(values);
      setSubmittedEmail(values.email);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to create account.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedEmail) {
    return (
      <AuthCard
        title="Check your inbox"
        description={`We sent a confirmation link to ${submittedEmail}. Open it to begin your StudyVerse journey.`}
      >
        <div className="bg-secondary text-secondary-foreground flex items-start gap-3 rounded-xl p-4 text-sm">
          <Check className="mt-0.5 size-4 shrink-0" />
          You can close this page after confirming your email.
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Begin your story"
        description="Create your account and go straight into the workspace. No confirmation email."
      footer={
        <>
          Already have an account?{' '}
          <Link className="text-foreground font-semibold" to="/login">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
        <div className="space-y-2">
          <Label htmlFor="displayName">Name</Label>
          <Input
            id="displayName"
            autoComplete="name"
            placeholder="Your name"
            {...form.register('displayName')}
          />
          <FieldError message={form.formState.errors.displayName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registerEmail">Email</Label>
          <Input
            id="registerEmail"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register('email')}
          />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="registerPassword">Password</Label>
            <Input
              id="registerPassword"
              type="password"
              autoComplete="new-password"
              {...form.register('password')}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...form.register('confirmPassword')}
            />
            <FieldError
              message={form.formState.errors.confirmPassword?.message}
            />
          </div>
        </div>
        <Button className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="animate-spin" />}
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-destructive text-xs">{message}</p>
  ) : null;
}
