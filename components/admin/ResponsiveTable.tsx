'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    mobile?: boolean;
    sortable?: boolean;
  }[];
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: (row: any) => void;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
  onRowClick?: (row: any) => void;
  className?: string;
}

export default function ResponsiveTable({
  data,
  columns,
  actions = [],
  onRowClick,
  className
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const mobileColumns = columns.filter(col => col.mobile !== false);
  const desktopColumns = columns;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {desktopColumns.map((column) => (
                      <th
                        key={column.key}
                        className={cn(
                          "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                          column.sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {column.sortable && (
                            <span className="text-gray-400">
                              {sortColumn === column.key ? (
                                sortDirection === 'asc' ? '↑' : '↓'
                              ) : (
                                '↕'
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    {actions.length > 0 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={cn(
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {desktopColumns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {actions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant={action.variant || "ghost"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                                aria-label={action.label}
                              >
                                {action.icon}
                              </Button>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {sortedData.map((row, index) => {
          const isExpanded = expandedRows.has(row.id || index.toString());
          
          return (
            <Card key={row.id || index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Main content */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {mobileColumns.slice(0, 2).map((column) => (
                        <div key={column.key} className="mb-2">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {column.label}
                          </div>
                          <div className="text-sm">
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {actions.length > 0 && (
                        <div className="flex items-center gap-1">
                          {actions.slice(0, 2).map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant={action.variant || "ghost"}
                              size="sm"
                              onClick={() => action.onClick(row)}
                              aria-label={action.label}
                            >
                              {action.icon}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {mobileColumns.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(row.id || index.toString())}
                          aria-label={isExpanded ? "Réduire" : "Développer"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && mobileColumns.length > 2 && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      {mobileColumns.slice(2).map((column) => (
                        <div key={column.key}>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {column.label}
                          </div>
                          <div className="text-sm">
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </div>
                        </div>
                      ))}
                      
                      {actions.length > 2 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Actions
                          </div>
                          <div className="flex items-center gap-2">
                            {actions.slice(2).map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant={action.variant || "ghost"}
                                size="sm"
                                onClick={() => action.onClick(row)}
                                aria-label={action.label}
                              >
                                {action.icon}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}