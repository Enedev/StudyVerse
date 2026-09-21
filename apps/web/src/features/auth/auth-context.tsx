import type { Session, User } from '@supabase/supabase-js';
import { createContext } from 'react';

export type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
};

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
