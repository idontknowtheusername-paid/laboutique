'use client';

import { useHydration } from '@/hooks/useHydration';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
    const isHydrated = useHydration();

    if (!isHydrated) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};