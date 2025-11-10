import { useState, useEffect } from 'react';

const breakpoints = {
  sm: 641,
  md: 781,
  lg: 1024,
  xl: 1600,
};

const getBreakpoint = (width: number) => {
  if (width < breakpoints.sm) return 'sm';
  if (width < breakpoints.md) return 'md';
  if (width < breakpoints.lg) return 'lg';
  if (width < breakpoints.xl) return 'xl';
  return 'xxl';
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<string>('md');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => setBreakpoint(getBreakpoint(window.innerWidth));

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = (breakpoint === 'sm' || breakpoint === 'md') && isClient;
  const isTablet = (breakpoint === 'md' || breakpoint === 'lg') && isClient;
  const isLarge = breakpoint === 'xxl' && isClient;

  return { breakpoint, isMobile, isTablet, isLarge };
};
