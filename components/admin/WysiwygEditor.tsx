'use client';

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

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
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="wysiwyg-editor">
      <Editor
        onInit={(evt: any, editor: any) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
          placeholder: placeholder,
          branding: false,
          statusbar: false,
          resize: false,
          setup: (editor: any) => {
            if (disabled) {
              editor.mode.set('readonly');
            }
            editor.on('change', () => {
              const content = editor.getContent();
              onChange(content);
            });
          }
        }}
      />
    </div>
  );
}