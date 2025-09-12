import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

export const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');
    const [windowSize, setWindowSize] = useState({
        width: 1024, // Default server-side value
        height: 768,
    });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Mark as client-side after hydration
        setIsClient(true);

        const handleResize = () => {
            const width = window.innerWidth;
            setWindowSize({
                width,
                height: window.innerHeight,
            });

            if (width >= breakpoints['2xl']) {
                setBreakpoint('2xl');
            } else if (width >= breakpoints.xl) {
                setBreakpoint('xl');
            } else if (width >= breakpoints.lg) {
                setBreakpoint('lg');
            } else if (width >= breakpoints.md) {
                setBreakpoint('md');
            } else if (width >= breakpoints.sm) {
                setBreakpoint('sm');
            } else {
                setBreakpoint('xs');
            }
        };

        // Set initial breakpoint only on client
        if (typeof window !== 'undefined') {
            handleResize();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    // Use safe defaults during SSR
    const isMobile = isClient ? (breakpoint === 'xs' || breakpoint === 'sm') : false;
    const isTablet = isClient ? breakpoint === 'md' : false;
    const isDesktop = isClient ? (breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl') : true;

    return {
        breakpoint,
        windowSize,
        isMobile,
        isTablet,
        isDesktop,
        isClient,
        isAbove: (bp: Breakpoint) => isClient && windowSize.width >= breakpoints[bp],
        isBelow: (bp: Breakpoint) => isClient && windowSize.width < breakpoints[bp],
    };
};