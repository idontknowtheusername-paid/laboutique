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
      return { success: false, error: 'Supabase not configured' };
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { success: true, url: data.publicUrl, path: filePath };
  } catch (err: any) {
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

