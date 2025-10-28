'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface WysiwygEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export default function WysiwygEditor({ 
  value, 
  onChange, 
  placeholder = "Saisissez votre contenu...",
  height = 400,
  disabled = false
}: WysiwygEditorProps) {

  return (
    <div className="wysiwyg-editor">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[300px] font-mono text-sm"
        style={{ height: `${height}px` }}
      />
      <p className="text-xs text-gray-500 mt-1">
        Vous pouvez utiliser du HTML basique (p, strong, em, ul, li, etc.)
      </p>
    </div>
  );
}