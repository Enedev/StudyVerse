import { supabase } from '@/lib/supabase/client';

type PrivateBucket = 'documents' | 'book-covers';

export async function uploadPrivateFile(
  bucket: PrivateBucket,
  path: string,
  file: File,
  contentType?: string,
) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: contentType || file.type || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createSignedFileUrl(bucket: PrivateBucket, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 30);

  if (error || !data) {
    throw new Error(error?.message ?? 'Unable to open the private file.');
  }

  return data.signedUrl;
}

export async function removePrivateFile(bucket: PrivateBucket, path: string) {
  await supabase.storage.from(bucket).remove([path]);
}
