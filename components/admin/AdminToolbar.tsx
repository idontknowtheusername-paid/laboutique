'use client';

import React from 'react';

interface AdminToolbarProps {
  children: React.ReactNode;
}

export default function AdminToolbar({ children }: AdminToolbarProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-row flex-wrap items-center gap-3">
      {children}
    </div>
  );
}

