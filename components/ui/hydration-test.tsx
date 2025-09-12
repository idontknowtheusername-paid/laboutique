'use client';

import React from 'react';
import { useHydration } from '@/hooks/useHydration';

export const HydrationTest: React.FC = () => {
    const isHydrated = useHydration();

    return (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-xs z-50">
            {isHydrated ? '✅ Hydrated' : '⏳ Loading...'}
        </div>
    );
};

export default HydrationTest;