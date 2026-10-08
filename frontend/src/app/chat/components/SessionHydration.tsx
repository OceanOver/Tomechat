'use client';

import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { parseAsString } from 'nuqs/parsers';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useSessionStore } from '@/store/session';

/**
 * Bridges outside state into the session store:
 * - injects the Next.js router so the store can navigate
 * - two-way sync between the `session` query param and `activeId`
 */
const SessionHydration = memo(() => {
  const router = useRouter();

  const [sessionParam, setSessionParam] = useQueryState(
    'session',
    parseAsString.withDefault('inbox').withOptions({ history: 'replace', throttleMs: 500 }),
  );

  const useStoreUpdater = createStoreUpdater(useSessionStore);
  // TODO: router should eventually be dropped from useSessionStore
  useStoreUpdater('router', router);
  useStoreUpdater('activeId', sessionParam);

  // Store -> URL: reflect activeId changes back into the query param.
  useEffect(() => {
    return useSessionStore.subscribe(
      (s) => s.activeId,
      (activeId) => setSessionParam(activeId),
    );
  }, [setSessionParam]);

  return null;
});

export default SessionHydration;
