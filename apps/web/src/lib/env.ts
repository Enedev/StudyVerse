import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error('Invalid frontend environment configuration', parsedEnv.error);
  throw new Error(
    'StudyVerse is missing required environment variables. See apps/web/.env.example.',
  );
}

export const env = parsedEnv.data;
