'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationBannerProps {
    type?: 'info' | 'success' | 'warning' | 'promo';
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    dismissible?: boolean;
    autoHide?: boolean;
    duration?: number;
    className?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
    type = 'info',
    title,
    message,
    action,
    dismissible = true,
    autoHide = false,
    duration = 5000,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoHide && duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoHide, duration]);

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <Gift className="w-5 h-5" />,
                    bgColor: 'bg-green-50 border-green-200',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-600'
                };
            case 'warning':
                return {
                    icon: <Zap className="w-5 h-5" />,
                    bgColor: 'bg-yellow-50 border-yellow-200',
                    textColor: 'text-yellow-800',
                    iconColor: 'text-yellow-600'
                };
            case 'promo':
                return {
                    icon: <Gift className="w-5 h-5" />,
                    bgColor: 'bg-purple-50 border-purple-200',
                    textColor: 'text-purple-800',
                    iconColor: 'text-purple-600'
                };
            default:
                return {
                    icon: <Info className="w-5 h-5" />,
                    bgColor: 'bg-blue-50 border-orange-200',
                    textColor: 'text-blue-800',
                    iconColor: 'text-orange-600'
                };
        }
    };

    if (!isVisible) return null;

    const config = getTypeConfig();

    return (
        <div className={cn(
            'border rounded-lg p-4 mb-4 transition-all duration-300',
            config.bgColor,
            config.textColor,
            className
        )}>
            <div className="flex items-start space-x-3">
                <div className={cn('flex-shrink-0', config.iconColor)}>
                    {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">{title}</h4>
                    <p className="text-sm opacity-90">{message}</p>
                </div>

                <div className="flex items-center space-x-2">
                    {action && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={action.onClick}
                            className="text-xs"
                        >
                            {action.label}
                        </Button>
                    )}

                    {dismissible && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsVisible(false)}
                            className="p-1 h-auto"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationBanner;