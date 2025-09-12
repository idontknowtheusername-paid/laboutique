import React from 'react';
import { AlertCircle, RefreshCw, Wifi, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
    type?: 'network' | 'empty' | 'generic' | 'cart';
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    type = 'generic',
    title,
    message,
    onRetry,
    className = ''
}) => {
    const getErrorConfig = () => {
        switch (type) {
            case 'network':
                return {
                    icon: <Wifi className="w-16 h-16 text-gray-300" />,
                    defaultTitle: 'Problème de connexion',
                    defaultMessage: 'Vérifiez votre connexion internet et réessayez.'
                };
            case 'empty':
                return {
                    icon: <ShoppingBag className="w-16 h-16 text-gray-300" />,
                    defaultTitle: 'Aucun produit trouvé',
                    defaultMessage: 'Aucun produit ne correspond à vos critères de recherche.'
                };
            case 'cart':
                return {
                    icon: <ShoppingBag className="w-16 h-16 text-gray-300" />,
                    defaultTitle: 'Votre panier est vide',
                    defaultMessage: 'Découvrez nos produits et ajoutez-les à votre panier.'
                };
            default:
                return {
                    icon: <AlertCircle className="w-16 h-16 text-gray-300" />,
                    defaultTitle: 'Une erreur est survenue',
                    defaultMessage: 'Quelque chose s\'est mal passé. Veuillez réessayer.'
                };
        }
    };

    const config = getErrorConfig();

    return (
        <Card className={`${className}`}>
            <CardContent className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                    {config.icon}
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-900">
                            {title || config.defaultTitle}
                        </h3>
                        <p className="text-gray-600 max-w-md">
                            {message || config.defaultMessage}
                        </p>
                    </div>
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            className="bg-beshop-primary hover:bg-blue-700"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Réessayer
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ErrorState;