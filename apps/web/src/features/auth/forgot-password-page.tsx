import { zodResolver } from '@hookform/resolvers/zod';
import { Check, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/features/auth/auth-card';
import { useAuth } from '@/features/auth/use-auth';

const schema = z.object({
  email: z.email('Enter a valid email address.'),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { requestPasswordReset } = useAuth();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const submit = async ({ email }: Values) => {
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setIsSent(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to send reset email.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={isSent ? 'Check your inbox' : 'Reset your password'}
      description={
        isSent
          ? 'If an account exists for that address, a reset link is on its way.'
          : 'Enter your email and we will send you a secure reset link.'
      }
      footer={
        <Link className="text-foreground font-semibold" to="/login">
          Return to sign in
        </Link>
      }
    >
      {isSent ? (
        <div className="bg-secondary text-secondary-foreground flex items-start gap-3 rounded-xl p-4 text-sm">
          <Check className="mt-0.5 size-4 shrink-0" />
          For your privacy, we do not reveal whether an email is registered.
        </div>
      ) : (
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <div className="space-y-2">
            <Label htmlFor="resetEmail">Email</Label>
            <Input
              id="resetEmail"
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
          <Button className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
