import { useEffect, useState } from 'react';

import { isInStandaloneMode } from '@/utils/matchMedia';

/**
 * Whether the app currently runs as an installed PWA (standalone window).
 * Starts as false — the check only makes sense on the client.
 */
export const useIsPWA = (): boolean => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(isInStandaloneMode());
  }, []);

  return isPWA;
};
