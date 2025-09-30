'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: () => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove();
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success': return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'error': return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  if (!isVisible) return null;

  return (
    <Card
      className={cn(
        "w-80 shadow-lg transition-all duration-300",
        isLeaving ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0",
        getColors()
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {toast.title}
            </div>
            {toast.description && (
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {toast.description}
              </div>
            )}
            
            {toast.action && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toast.action.onClick}
                  className="text-xs"
                >
                  {toast.action.label}
                </Button>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="flex-shrink-0 p-1"
            aria-label="Fermer la notification"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Toast
export function LoadingToast({ 
  title, 
  description 
}: { 
  title: string; 
  description?: string; 
}) {
  return (
    <Card className="w-80 shadow-lg border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {title}
            </div>
            {description && (
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}