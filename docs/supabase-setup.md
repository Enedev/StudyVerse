# Apply the StudyVerse Supabase migrations

The application APIs require the versioned database schema and RLS policies.
Apply them through the Supabase Dashboard without copying any credentials into
the repository.

1. Open the StudyVerse project in Supabase.
2. Open **SQL Editor** and create a new query.
3. Copy and run the complete contents of
   `supabase/migrations/001_initial_schema.sql`.
4. Create another query and run
   `supabase/migrations/002_rls_policies.sql`.
5. Create a final query and run
   `supabase/migrations/003_storage.sql`.
6. Run `supabase/migrations/004_profile_backfill.sql` to create profiles for
   users who registered before the migrations were applied.

Run each file only once and in that order. The first migration creates the
tables and profile trigger, the second enables RLS, the third creates private
Storage buckets, and the fourth safely backfills existing profiles.

After applying them:

1. Restart `pnpm dev` if it is already running.
2. Register or sign in.
3. Create a task and calendar event.
4. Confirm that each user sees only their own records.

The web application never uses the Supabase secret key. Authenticated domain
requests go through NestJS, which forwards the caller's access token so RLS
continues to enforce ownership.
