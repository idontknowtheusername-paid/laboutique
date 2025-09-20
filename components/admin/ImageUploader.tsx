'use client';

import React from 'react';
import { uploadToStorage, removeFromStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trash2, Upload } from 'lucide-react';
import Image from 'next/image';

type UploadedItem = {
  url: string;
  path?: string;
};

export function ImageUploader({
  label = 'Images',
  bucket,
  folder,
  multiple = true,
  value,
  onChange,
}: {
  label?: string;
  bucket: string;
  folder?: string;
  multiple?: boolean;
  value: UploadedItem[] | UploadedItem | null | undefined;
  onChange: (next: UploadedItem[] | UploadedItem | null) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const items: UploadedItem[] = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    const next: UploadedItem[] = [...items];
    
    // Upload all files in parallel for better performance
    const uploadPromises = Array.from(files).map(async (file, index) => {
      const res = await uploadToStorage(bucket, file, folder);
      setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
      if (res.success && res.url) {
        return { url: res.url, path: res.path };
      }
      return null;
    });
    
    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((item) => item !== null) as UploadedItem[];
      next.push(...successfulUploads);
    } catch (error) {
      console.error('Upload error:', error);
    }
    
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    onChange(multiple ? next : next[0] ?? null);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function removeAt(index: number) {
    const target = items[index];
    if (target?.path) {
      await removeFromStorage(bucket, target.path);
    }
    const next = items.filter((_, i) => i !== index);
    onChange(multiple ? next : next[0] ?? null);
  }

  return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          {uploading && (
            <Badge className="bg-blue-600">
              {uploadProgress.total > 0 
                ? `${uploadProgress.current}/${uploadProgress.total} images` 
                : 'Upload...'
              }
            </Badge>
          )}
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            uploading 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Upload className={`w-8 h-8 mx-auto mb-3 ${uploading ? 'text-blue-500 animate-pulse' : 'text-gray-500'}`} />
          <p className={`text-sm ${uploading ? 'text-blue-600' : 'text-gray-600'}`}>
            {uploading 
              ? 'Upload en cours...' 
              : 'Glissez-déposez des images ici, ou cliquez pour sélectionner'
            }
          </p>
          {!uploading && (
            <p className="text-xs text-gray-500 mt-1">
              Formats supportés: JPG, PNG, WebP (max 10MB par image)
            </p>
          )}
          <Input
            ref={inputRef as any}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            disabled={uploading}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          />
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((img, idx) => (
              <div key={idx} className="relative group border rounded-lg overflow-hidden">
                <div className="relative w-full h-32">
                  <Image src={img.url} alt="uploaded" fill sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" onClick={(e)=>{ e.stopPropagation(); removeAt(idx); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

