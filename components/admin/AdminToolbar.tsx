'use client';

import React from 'react';

interface AdminToolbarProps {
  children: React.ReactNode;
}

export default function AdminToolbar({ children }: AdminToolbarProps) {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col md:flex-row items-center gap-3">
      {children}
      <div className="ml-auto" />
    </div>
  );
}

