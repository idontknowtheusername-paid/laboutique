import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const filesFieldA = formData.getAll('file') as File[];
    const filesFieldB = formData.getAll('files[]') as File[];
    const files = [...filesFieldA, ...filesFieldB].filter(Boolean) as File[];
    const bucket = (formData.get('bucket') as string) || 'images';
    const folder = (formData.get('folder') as string) || 'products';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Server storage not configured' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey);

    const results: { success: boolean; url?: string; path?: string; error?: string }[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const { error } = await supabase.storage
          .from(bucket)
          .upload(key, buffer, { contentType: file.type || 'application/octet-stream', upsert: false });
        if (error) {
          results.push({ success: false, error: error.message });
          continue;
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(key);
        results.push({ success: true, url: data.publicUrl, path: key });
      } catch (e: any) {
        results.push({ success: false, error: e?.message || 'Upload failed' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}

