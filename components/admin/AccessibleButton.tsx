'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  description?: string;
  ariaDescribedBy?: string;
  className?: string;
}

export default function AccessibleButton({
  children,
  variant = 'default',
  size = 'default',
  loading = false,
  loadingText = 'Chargement...',
  icon,
  iconPosition = 'left',
  description,
  ariaDescribedBy,
  className,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      className={cn(className)}
      aria-describedby={ariaDescribedBy}
      aria-label={typeof children === 'string' ? children : undefined}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          {loadingText}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2" aria-hidden="true">
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2" aria-hidden="true">
              {icon}
            </span>
          )}
        </>
      )}
      {description && (
        <span className="sr-only">{description}</span>
      )}
    </Button>
  );
}