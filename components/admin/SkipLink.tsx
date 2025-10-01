'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        "bg-jomionstore-primary text-white px-4 py-2 rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "z-50 transition-all duration-200",
        className
      )}
      onFocus={(e) => {
        e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
    >
      {children}
    </a>
  );
}

export function SkipLinks() {
  return (
    <>
      <SkipLink href="#main-content">
        Aller au contenu principal
      </SkipLink>
      <SkipLink href="#navigation">
        Aller à la navigation
      </SkipLink>
      <SkipLink href="#search">
        Aller à la recherche
      </SkipLink>
    </>
  );
}