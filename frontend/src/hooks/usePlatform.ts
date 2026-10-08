import { useSyncExternalStore, useRef } from 'react';

import { getBrowser, getPlatform, isMacOS } from '@/utils/platform';

const subscribe = () => () => {};

/**
 * Platform detection that is safe for SSR hydration: the server snapshot is
 * always `false`, and React re-renders with the real client value after
 * hydration instead of reporting a mismatch.
 */
export const useIsMacOS = (): boolean =>
  useSyncExternalStore(subscribe, isMacOS, () => false);

export const usePlatform = () => {
  const platform = useRef(getPlatform());
  const browser = useRef(getBrowser());
  return {
    isApple: platform.current && ['Mac OS', 'iOS'].includes(platform.current),
    isChrome: browser.current === 'Chrome',
    isIOS: platform.current === 'iOS',
    isMacOS: platform.current === 'Mac OS',
    isSafari: browser.current === 'Safari',
  };
};
