import { memo } from 'react';

import { useSessionStore } from '@/store/session';

import DefaultMode from './DefaultMode';
import SearchMode from './SearchMode';

const SessionListContent = memo(() => {
  const isSearching = useSessionStore((s) => s.isSearching);

  const ListBody = isSearching ? SearchMode : DefaultMode;

  return <ListBody />;
});

export default SessionListContent;
