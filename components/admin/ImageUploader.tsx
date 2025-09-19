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
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const items: UploadedItem[] = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const next: UploadedItem[] = [...items];
    for (const file of Array.from(files)) {
      const res = await uploadToStorage(bucket, file, folder);
      if (res.success && res.url) next.push({ url: res.url, path: res.path });
    }
    setUploading(false);
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
          {uploading && <Badge className="bg-blue-600">Upload...</Badge>}
        </div>

        <div
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Upload className="w-5 h-5 mx-auto mb-2 text-gray-500" />
          <p className="text-sm text-gray-600">Glissez-déposez des images ici, ou cliquez pour sélectionner</p>
          <Input
            ref={inputRef as any}
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
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

