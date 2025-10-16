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
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-700" />
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

export const showLoadingToast = (message: string, id?: string) => {
    return toast.loading(message, {
        id,
        duration: Infinity,
    });
};

export const showRetryToast = (message: string, onRetry: () => void, retryCount?: number) => {
    const retryText = retryCount ? ` (Tentative ${retryCount})` : '';

    toast.error(
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                    <p className="font-medium">Erreur{retryText}</p>
                    <p className="text-sm text-gray-600">{message}</p>
                </div>
            </div>
        </div>,
        {
            duration: 6000,
            action: {
                label: 'Réessayer',
                onClick: onRetry,
            },
        }
    );
};

export const showNetworkErrorToast = (onRetry?: () => void) => {
    toast.error(
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
                <p className="font-medium">Problème de connexion</p>
                <p className="text-sm text-gray-600">Vérifiez votre connexion internet</p>
            </div>
        </div>,
        {
            duration: 8000,
            action: onRetry ? {
                label: 'Réessayer',
                onClick: onRetry,
            } : undefined,
        }
    );
};

export const showAuthErrorToast = (message?: string) => {
    toast.error(
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
                <p className="font-medium">Erreur d'authentification</p>
                <p className="text-sm text-gray-600">
                    {message || 'Veuillez vous reconnecter'}
                </p>
            </div>
        </div>,
        {
            duration: 5000,
            action: {
                label: 'Se connecter',
                onClick: () => window.location.href = '/auth/login',
            },
        }
    );
};

export const showValidationErrorToast = (errors: string[]) => {
    const errorList = errors.slice(0, 3); // Limit to 3 errors
    const hasMore = errors.length > 3;

    toast.error(
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
                <p className="font-medium">Erreurs de validation</p>
                <div className="text-sm text-gray-600">
                    {errorList.map((error, index) => (
                        <p key={index}>• {error}</p>
                    ))}
                    {hasMore && <p>• Et {errors.length - 3} autres erreurs...</p>}
                </div>
            </div>
        </div>,
        {
            duration: 6000,
        }
    );
};

export const showProgressToast = (message: string, progress: number, id?: string) => {
    return toast.loading(
        <div className="flex items-center space-x-3 w-full">
            <div className="flex-1">
                <p className="font-medium">{message}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
            </div>
        </div>,
        {
            id,
            duration: Infinity,
        }
    );
};

export const dismissToast = (id: string) => {
    toast.dismiss(id);
};

export const dismissAllToasts = () => {
    toast.dismiss();
};