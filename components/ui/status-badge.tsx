'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: 'new' | 'hot' | 'sale' | 'popular' | 'limited' | 'trending';
    className?: string;
    animate?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    className = '',
    animate = true
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'new':
                return {
                    text: 'Nouveau',
                    className: 'bg-blue-500 text-white',
                    animation: animate ? 'animate-pulse' : ''
                };
            case 'hot':
                return {
                    text: '🔥 HOT',
                    className: 'bg-red-500 text-white',
                    animation: animate ? 'animate-bounce' : ''
                };
            case 'sale':
                return {
                    text: 'PROMO',
                    className: 'bg-green-500 text-white',
                    animation: animate ? 'animate-pulse' : ''
                };
            case 'popular':
                return {
                    text: '⭐ Populaire',
                    className: 'bg-yellow-500 text-white',
                    animation: ''
                };
            case 'limited':
                return {
                    text: '⚡ Limité',
                    className: 'bg-purple-500 text-white',
                    animation: animate ? 'animate-pulse' : ''
                };
            case 'trending':
                return {
                    text: '📈 Tendance',
                    className: 'bg-pink-500 text-white',
                    animation: animate ? 'animate-bounce' : ''
                };
            default:
                return {
                    text: status,
                    className: 'bg-gray-500 text-white',
                    animation: ''
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Badge
            className={cn(
                config.className,
                config.animation,
                'text-xs font-medium px-2 py-1',
                className
            )}
        >
            {config.text}
        </Badge>
    );
};

export default StatusBadge;