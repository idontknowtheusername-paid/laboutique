'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbSegment[];
  actions?: React.ReactNode;
}

export default function AdminPageHeader({ title, subtitle, breadcrumb, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-4">
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="text-xs text-gray-500 mb-1">
          {breadcrumb.map((seg, idx) => (
            <span key={`${seg.label}-${idx}`}>
              {idx > 0 && <span className="mx-2">/</span>}
              {seg.href ? (
                <a href={seg.href} className="text-gray-500 hover:text-gray-700 hover:underline">
                  {seg.label}
                </a>
              ) : (
                <span className="text-gray-700">{seg.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

