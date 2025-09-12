'use client';

import React, { useEffect, useState } from 'react';

interface ClientSafeProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    className?: string;
}

/**
 * Composant qui s'assure que ses enfants ne sont rendus que côté client
 * pour éviter les erreurs d'hydratation
 */
export const ClientSafe: React.FC<ClientSafeProps> = ({
    children,
    fallback = null,
    className = ''
}) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return fallback ? <div className={className}>{fallback}</div> : null;
    }

    return <div className={className}>{children}</div>;
};

export default ClientSafe;