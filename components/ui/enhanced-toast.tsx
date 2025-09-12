'use client';

import React from 'react';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Info, X, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToastOptions {
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    duration?: number;
}

export const showSuccessToast = (message: string, options?: ToastOptions) => {
    toast.success(message, {
        description: options?.description,
        duration: options?.duration || 3000,
        action: options?.action ? {
            label: options.action.label,
            onClick: options.action.onClick,
        } : undefined,
    });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
    toast.error(message, {
        description: options?.description,
        duration: options?.duration || 4000,
        action: options?.action ? {
            label: options.action.label,
            onClick: options.action.onClick,
        } : undefined,
    });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
    toast.info(message, {
        description: options?.description,
        duration: options?.duration || 3000,
        action: options?.action ? {
            label: options.action.label,
            onClick: options.action.onClick,
        } : undefined,
    });
};

export const showCartToast = (productName: string, quantity: number = 1) => {
    toast.success(
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-green-600" />
            </div>
            <div>
                <p className="font-medium">Ajouté au panier</p>
                <p className="text-sm text-gray-600">
                    {quantity > 1 ? `${quantity}x ` : ''}{productName}
                </p>
            </div>
        </div>,
        {
            duration: 3000,
            action: {
                label: 'Voir le panier',
                onClick: () => window.location.href = '/cart',
            },
        }
    );
};

export const showWishlistToast = (productName: string, added: boolean = true) => {
    toast.success(
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-pink-600" />
            </div>
            <div>
                <p className="font-medium">
                    {added ? 'Ajouté aux favoris' : 'Retiré des favoris'}
                </p>
                <p className="text-sm text-gray-600">{productName}</p>
            </div>
        </div>,
        {
            duration: 2000,
            action: added ? {
                label: 'Voir les favoris',
                onClick: () => window.location.href = '/wishlist',
            } : undefined,
        }
    );
};

export const showQuickViewToast = (productName: string) => {
    toast.info(
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div>
                <p className="font-medium">Aperçu rapide</p>
                <p className="text-sm text-gray-600">{productName}</p>
            </div>
        </div>,
        {
            duration: 2000,
        }
    );
};