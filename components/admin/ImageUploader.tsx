'use client';

import React from 'react';
import { removeFromStorage } from '@/lib/storage';
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
    
    // Vérifier la limite de 10 images
    const maxImages = 10;
    const currentCount = items.length;
    const newFiles = Array.from(files);
    
    if (currentCount + newFiles.length > maxImages) {
      alert(`Vous ne pouvez ajouter que ${maxImages} images maximum. Vous avez déjà ${currentCount} images.`);
      return;
    }
    
    // Vérifier la taille des fichiers (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = newFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(`Certains fichiers sont trop volumineux (max 10MB). Fichiers rejetés: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setUploading(true);
    setUploadProgress({ current: 0, total: newFiles.length });
    const next: UploadedItem[] = [...items];
    
    // Upload all files via server API route (service key) in parallel
    const uploadPromises = newFiles.map(async (file) => {
      try {
        const form = new FormData();
        form.append('file', file);
        form.append('bucket', bucket);
        if (folder) form.append('folder', folder);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const json = await res.json();
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
        if (!res.ok) {
          console.error('Upload failed for', file.name, json.error);
          return null;
        }
        return { url: json.url, path: json.path } as UploadedItem;
      } catch (error) {
        console.error('Upload error for', file.name, error);
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
        return null;
      }
    });
    
    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((item) => item !== null) as UploadedItem[];
      next.push(...successfulUploads);
      
      if (successfulUploads.length < newFiles.length) {
        const failedCount = newFiles.length - successfulUploads.length;
        alert(`${failedCount} image(s) n'ont pas pu être uploadées. Vérifiez la configuration Supabase.`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload des images. Vérifiez la configuration Supabase.');
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{items.length}/10 images</span>
            {uploading && (
              <Badge className="bg-blue-600">
                {uploadProgress.total > 0 
                  ? `${uploadProgress.current}/${uploadProgress.total} images` 
                  : 'Upload...'
                }
              </Badge>
            )}
          </div>
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
          role="button"
          aria-label="Ajouter des images"
        >
          <Upload className={`w-8 h-8 mx-auto mb-3 ${uploading ? 'text-blue-500 animate-pulse' : 'text-gray-500'}`} />
          <p className={`text-sm ${uploading ? 'text-blue-600' : 'text-gray-600'}`}>
            {uploading 
              ? 'Upload en cours...' 
              : multiple 
                ? 'Glissez-déposez plusieurs images ici, ou cliquez pour sélectionner plusieurs fichiers'
                : 'Glissez-déposez une image ici, ou cliquez pour sélectionner'
            }
          </p>
          {!uploading && (
            <p className="text-xs text-gray-500 mt-1">
              Formats supportés: JPG, PNG, WebP (max 10MB par image, 10 images max)
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
          {multiple && !uploading && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => inputRef.current?.click()}
            >
              Sélectionner plusieurs images
            </Button>
          )}
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

