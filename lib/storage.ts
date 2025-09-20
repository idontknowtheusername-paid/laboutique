import supabase, { isSupabaseConfigured } from '@/lib/supabase';

export type UploadResult = {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
};

export async function uploadToStorage(
  bucket: string,
  file: File,
  folder: string = ''
): Promise<UploadResult> {
  try {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing'
      });
      return { success: false, error: 'Supabase not configured' };
    }

    // Vérifier que le bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return { success: false, error: `Bucket error: ${bucketsError.message}` };
    }

    const bucketExists = buckets?.some(b => b.name === bucket);
    if (!bucketExists) {
      console.error('Bucket does not exist:', bucket, 'Available buckets:', buckets?.map(b => b.name));
      return { success: false, error: `Bucket '${bucket}' does not exist` };
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log('Uploading file:', { fileName, filePath, bucket, folder, size: file.size, type: file.type });

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    console.log('Upload successful:', { url: data.publicUrl, path: filePath });
    return { success: true, url: data.publicUrl, path: filePath };
  } catch (err: any) {
    console.error('Upload exception:', err);
    return { success: false, error: err?.message || 'Upload failed' };
  }
}

export async function removeFromStorage(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Remove failed' };
  }
}

