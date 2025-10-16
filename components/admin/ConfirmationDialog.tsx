'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
  icon
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'destructive': return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'info': return <Info className="w-6 h-6 text-orange-500" />;
      default: return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
  };

  const getConfirmVariant = () => {
    switch (variant) {
      case 'destructive': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-3">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmVariant()}
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Traitement...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Quick confirmation hooks
export function useConfirmation() {
  const [dialog, setDialog] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive' | 'warning' | 'info';
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'default'
  });

  const confirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    variant: 'default' | 'destructive' | 'warning' | 'info' = 'default'
  ) => {
    setDialog({
      open: true,
      title,
      description,
      onConfirm,
      variant
    });
  };

  const ConfirmationComponent = () => (
    <ConfirmationDialog
      open={dialog.open}
      onOpenChange={(open) => setDialog(prev => ({ ...prev, open }))}
      title={dialog.title}
      description={dialog.description}
      onConfirm={dialog.onConfirm}
      variant={dialog.variant}
    />
  );

  return { confirm, ConfirmationComponent };
}