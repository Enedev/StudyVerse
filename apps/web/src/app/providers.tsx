import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

import { queryClient } from '@/app/query-client';
import { AuthProvider } from '@/features/auth/auth-context';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
