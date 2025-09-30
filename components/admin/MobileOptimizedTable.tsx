'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/useCache';

interface MobileOptimizedTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
    mobile?: boolean;
    sortable?: boolean;
    searchable?: boolean;
    width?: string;
  }[];
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'destructive' | 'outline';
    mobile?: boolean;
  }[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export default function MobileOptimizedTable<T extends { id: string }>({
  data,
  columns,
  actions = [],
  searchable = true,
  sortable = true,
  filterable = true,
  onRowClick,
  className,
  loading = false,
  emptyMessage = 'Aucune donnée disponible'
}: MobileOptimizedTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search pour optimiser les performances
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrage et tri des données
  const processedData = useMemo(() => {
    let filtered = data;

    // Filtrage par recherche
    if (debouncedSearchTerm) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      filtered = filtered.filter(row =>
        searchableColumns.some(col => {
          const value = row[col.key];
          return value && value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        })
      );
    }

    // Tri
    if (sortColumn && sortable) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, debouncedSearchTerm, sortColumn, sortDirection, columns, sortable]);

  const handleSort = (columnKey: keyof T) => {
    if (!sortable) return;
    
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

  const mobileColumns = columns.filter(col => col.mobile !== false);
  const desktopColumns = columns;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jomiastore-primary"></div>
            <span className="ml-2">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (processedData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barre de recherche et filtres */}
      {(searchable || filterable) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {searchable && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              
              {filterable && (
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full sm:w-auto"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                        key={String(column.key)}
                        className={cn(
                          "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                          column.sortable && sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        onClick={() => column.sortable && handleSort(column.key)}
                        style={{ width: column.width }}
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {column.sortable && sortable && (
                            <span className="text-gray-400">
                              {sortColumn === column.key ? (
                                sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                              ) : (
                                <MoreHorizontal className="w-4 h-4" />
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
                  {processedData.map((row, index) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {desktopColumns.map((column) => (
                        <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm">
                          {column.render ? column.render(row[column.key], row) : String(row[column.key])}
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
        {processedData.map((row, index) => {
          const isExpanded = expandedRows.has(row.id);
          const mobileActions = actions.filter(action => action.mobile !== false);
          
          return (
            <Card key={row.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Main content */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {mobileColumns.slice(0, 2).map((column) => (
                        <div key={String(column.key)} className="mb-2">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {column.label}
                          </div>
                          <div className="text-sm">
                            {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {mobileActions.slice(0, 2).map((action, actionIndex) => (
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
                      
                      {mobileColumns.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(row.id)}
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
                        <div key={String(column.key)}>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {column.label}
                          </div>
                          <div className="text-sm">
                            {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                          </div>
                        </div>
                      ))}
                      
                      {mobileActions.length > 2 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Actions
                          </div>
                          <div className="flex items-center gap-2">
                            {mobileActions.slice(2).map((action, actionIndex) => (
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