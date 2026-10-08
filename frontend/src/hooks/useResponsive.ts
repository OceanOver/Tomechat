import { useEffect, useState } from 'react';

interface ResponsiveScreens {
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

export interface ResponsiveResult {
  isDesktop?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
  /**
   * undefined during SSR; only has a real value in the browser
   */
  screens?: ResponsiveScreens;
}

const MOBILE_QUERY = '(max-width: 639px)';
const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * matchMedia-based responsive hook that is safe without a client
 * - SSR: returns safe defaults (all undefined)
 * - Browser: subscribes to matchMedia changes and updates in real time
 */
export const useResponsive = (): ResponsiveResult => {
  const [screens, setScreens] = useState<ResponsiveScreens | undefined>(undefined);

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const desktopQuery = window.matchMedia(DESKTOP_QUERY);

    const update = () => {
      setScreens({
        isDesktop: desktopQuery.matches,
        isMobile: mobileQuery.matches,
        isTablet: !mobileQuery.matches && !desktopQuery.matches,
      });
    };

    update();
    mobileQuery.addEventListener('change', update);
    desktopQuery.addEventListener('change', update);
    return () => {
      mobileQuery.removeEventListener('change', update);
      desktopQuery.removeEventListener('change', update);
    };
  }, []);

  return {
    isDesktop: screens?.isDesktop,
    isMobile: screens?.isMobile,
    isTablet: screens?.isTablet,
    screens,
  };
};
