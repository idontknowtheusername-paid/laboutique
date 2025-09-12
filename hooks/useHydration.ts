import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si le composant est hydraté côté client
 * Utile pour éviter les erreurs de hydratation avec localStorage, etc.
 */
export function useHydration() {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    return isHydrated;
}