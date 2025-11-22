'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AccessibleTableProps {
  children: React.ReactNode;
  className?: string;
  caption?: string;
  summary?: string;
}

export default function AccessibleTable({ 
  children, 
  className, 
  caption, 
  summary 
}: AccessibleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table 
        className={cn("w-full", className)}
        role="table"
        aria-label={caption}
        summary={summary}
      >
        {caption && (
          <caption className="sr-only">
            {caption}
          </caption>
        )}
        {children}
      </table>
    </div>
  );
}

interface AccessibleTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AccessibleTableHeader({ children, className }: AccessibleTableHeaderProps) {
  return (
    <thead className={cn("bg-gray-50", className)} role="rowgroup">
      {children}
    </thead>
  );
}

interface AccessibleTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function AccessibleTableBody({ children, className }: AccessibleTableBodyProps) {
  return (
    <tbody className={cn("bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", className)} role="rowgroup">
      {children}
    </tbody>
  );
}

interface AccessibleTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  role?: string;
  ariaLabel?: string;
}

export function AccessibleTableRow({ 
  children, 
  className, 
  onClick, 
  role = "row",
  ariaLabel 
}: AccessibleTableRowProps) {
  return (
    <tr 
      className={cn(className)}
      role={role}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={ariaLabel}
    >
      {children}
    </tr>
  );
}

interface AccessibleTableCellProps {
  children: React.ReactNode;
  className?: string;
  scope?: 'row' | 'col';
  headers?: string;
  role?: string;
}

export function AccessibleTableCell({ 
  children, 
  className, 
  scope,
  headers,
  role = "cell"
}: AccessibleTableCellProps) {
  return (
    <td 
      className={cn("px-6 py-4 whitespace-nowrap text-sm", className)}
      scope={scope}
      headers={headers}
      role={role}
    >
      {children}
    </td>
  );
}

interface AccessibleTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  scope?: 'row' | 'col';
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | 'none';
  onSort?: () => void;
}

export function AccessibleTableHeaderCell({ 
  children, 
  className, 
  scope = 'col',
  sortable = false,
  sortDirection = 'none',
  onSort
}: AccessibleTableHeaderCellProps) {
  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (sortable && onSort && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSort();
    }
  };

  return (
    <th 
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
        sortable && "cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500",
        className
      )}
      scope={scope}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={sortable ? 0 : undefined}
      role={sortable ? "columnheader button" : "columnheader"}
      aria-sort={sortable ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : undefined}
      aria-label={sortable ? `Trier par ${children}` : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className="sr-only">
            {sortDirection === 'asc' ? 'Tri croissant' : 
             sortDirection === 'desc' ? 'Tri décroissant' : 
             'Non trié'}
          </span>
        )}
        {sortable && (
          <span aria-hidden="true">
            {sortDirection === 'asc' ? '↑' : 
             sortDirection === 'desc' ? '↓' : 
             '↕'}
          </span>
        )}
      </div>
    </th>
  );
}