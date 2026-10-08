import { useEffect } from 'react';

import { useGlobalStore } from '../store';

/**
 * Run an effect that depends on persisted global state, waiting for rehydration
 * when it has not happened yet.
 */
export const useEffectAfterGlobalHydrated = (
  fn: (store: typeof useGlobalStore) => void,
  deps: any[] = [],
) => {
  useEffect(() => {
    // Store is already ready: behave like a plain useEffect call.
    if (useGlobalStore.persist.hasHydrated()) {
      fn(useGlobalStore);
      return;
    }

    // Otherwise defer until persistence finishes restoring state.
    useGlobalStore.persist.onFinishHydration(() => {
      fn(useGlobalStore);
    });
  }, deps);
};
