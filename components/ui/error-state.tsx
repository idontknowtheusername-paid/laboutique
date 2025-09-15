import React from 'react';
import { AlertCircle, RefreshCw, Wifi, ShoppingBag, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getErrorType, getErrorMessage } from '@/lib/utils/retry';

interface ErrorStateProps {
    type?: 'network' | 'empty' | 'generic' | 'cart' | 'auth' | 'validation' | 'server';
    title?: string;
    message?: string;
    error?: Error;
    onRetry?: () => void;
    onGoHome?: () => void;
    onGoBack?: () => void;
    showRetry?: boolean;
    showNavigation?: boolean;
    retryCount?: number;
    maxRetries?: number;
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    type,
    title,
    message,
    error,
    onRetry,
    onGoHome,
    onGoBack,
    showRetry = true,
    showNavigation = false,
    retryCount = 0,
    maxRetries = 3,
    className = ''
}) => {
    // Auto-detect error type if not provided
    const errorType = type || (error ? getErrorType(error) : 'generic');

    const getErrorConfig = () => {
        switch (errorType) {
            case 'network':
                return {
                    icon: <Wifi className="w-16 h-16 text-red-300" />,
                    defaultTitle: 'Problème de connexion',
                    defaultMessage: 'Vérifiez votre connexion internet et réessayez.',
                    color: 'red'
                };
            case 'auth':
                return {
                    icon: <AlertCircle className="w-16 h-16 text-orange-300" />,
                    defaultTitle: 'Erreur d\'authentification',
                    defaultMessage: 'Votre session a expiré. Veuillez vous reconnecter.',
                    color: 'orange'
                };
            case 'validation':
                return {
                    icon: <AlertCircle className="w-16 h-16 text-yellow-300" />,
                    defaultTitle: 'Données invalides',
                    defaultMessage: 'Vérifiez les informations saisies et réessayez.',
                    color: 'yellow'
                };
            case 'server':
                return {
                    icon: <AlertCircle className="w-16 h-16 text-red-300" />,
                    defaultTitle: 'Erreur du serveur',
                    defaultMessage: 'Le serveur rencontre des difficultés. Veuillez réessayer plus tard.',
                    color: 'red'
                };
            case 'empty':
                return {
                    icon: <ShoppingBag className="w-16 h-16 text-gray-300" />,
                    defaultTitle: 'Aucun résultat',
                    defaultMessage: 'Aucun élément ne correspond à vos critères.',
                    color: 'gray'
                };
            case 'cart':
                return {
                    icon: <ShoppingBag className="w-16 h-16 text-gray-300" />,
                    defaultTitle: 'Votre panier est vide',
                    defaultMessage: 'Découvrez nos produits et ajoutez-les à votre panier.',
                    color: 'gray'
                };
            default:
                return {
                    icon: <AlertCircle className="w-16 h-16 text-gray-300" />,
                    defaultTitle: 'Une erreur est survenue',
                    defaultMessage: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
                    color: 'gray'
                };
        }
    };

    const config = getErrorConfig();

    // Use error message if available and no custom message provided
    const displayMessage = message || (error ? getErrorMessage(error, errorType) : config.defaultMessage);
    const canRetry = showRetry && onRetry && retryCount < maxRetries;

    const handleGoHome = () => {
        if (onGoHome) {
            onGoHome();
        } else {
            window.location.href = '/';
        }
    };

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
        } else if (window.history.length > 1) {
            window.history.back();
        } else {
            handleGoHome();
        }
    };

    return (
        <Card className={`${className}`}>
            <CardContent className="text-center py-12">
                <div className="flex flex-col items-center space-y-6">
                    {config.icon}

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-900">
                            {title || config.defaultTitle}
                        </h3>
                        <p className="text-gray-600 max-w-md">
                            {displayMessage}
                        </p>

                        {retryCount > 0 && (
                            <p className="text-sm text-gray-500">
                                Tentative {retryCount} sur {maxRetries}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                        {canRetry && (
                            <Button
                                onClick={onRetry}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Réessayer
                            </Button>
                        )}

                        {showNavigation && (
                            <>
                                <Button
                                    onClick={handleGoBack}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour
                                </Button>

                                <Button
                                    onClick={handleGoHome}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Accueil
                                </Button>
                            </>
                        )}
                    </div>

                    {error && process.env.NODE_ENV === 'development' && (
                        <details className="w-full text-left max-w-md">
                            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                Détails de l'erreur (dev)
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                                <div className="mb-2">
                                    <strong>Message:</strong> {error.message}
                                </div>
                                {error.stack && (
                                    <div>
                                        <strong>Stack:</strong>
                                        <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                                    </div>
                                )}
                            </div>
                        </details>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ErrorState;