'use client';

import React from 'react';
import { useHydration } from '@/hooks/useHydration';

interface NoSSRProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Composant qui empêche le rendu côté serveur de ses enfants
 * Utile pour éviter les erreurs d'hydratation
 */
export const NoSSR: React.FC<NoSSRProps> = ({
    children,
    fallback = null
}) => {
    const isHydrated = useHydration();

    if (!isHydrated) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default NoSSR;